import * as functions from "firebase-functions";
import {
    REF_ZODIAC_GAME,
    PLAYERS,
    STATE,
    STATE_CHILDREN,
    ZODIAC_GAME_STATUSES,
    ZODIAC_GAME,
    LOCK_CHANGE_ZODIAC_GAME_STATUS,
    STATUS_TRANSITIONS,
    PLAYERS_FBID_CHILDREN,
    ZODIAC_GAME_SLACK_CHANEL,
    REF_TOP_USER,
    PLAYERS_BETTING,
} from "./constants"
import * as Service from "./service";

exports.TestLog = functions.https.onCall(async (data, context) => {
    console.log("data testLog: " + data.parameters);
    const response = {
        status: "OK",
        message: "OK"
    };
    return JSON.stringify(response);
})

exports.ChangeZodiacGameStatus = functions
    .runWith({
        maxInstances: 1 // Giới hạn số lượng phiên bản tối đa là 1
    })
    .database.ref(ZODIAC_GAME + "/" + STATE + "/" + STATE_CHILDREN.STATUS).onUpdate(async (change, context) => {
        console.log("Start handle status: " + new Date().toString())
        LOCK_CHANGE_ZODIAC_GAME_STATUS.take(async function() {
            console.log("Start LOCK: " + new Date().toString())

            const beforeVal = change.before.val();
            const currentVal = change.after.val();
        try {
            const beforeStatusSnapshot = await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.BEFORE_STATUS).once("value");
            const beforeStatus = beforeStatusSnapshot.val();
            console.log("Before status (change): " + beforeVal);
            console.log("Current status: " + currentVal);
            console.log("Before status: " + beforeStatus);

            if (currentVal === ZODIAC_GAME_STATUSES.PAUSE) {
                console.log("PAUSE ZODIAC GAME");
                return;
            }

            // Nếu là status retry thì update lại status trước đó để chạy lại
            if(currentVal === ZODIAC_GAME_STATUSES.RETRY) {
                console.log("RETRY");
                if(beforeVal === ZODIAC_GAME_STATUSES.PAUSE) {
                    Service.setStatusZodiacGame(currentVal, beforeStatus, 0);
                } else {
                    Service.setStatusZodiacGameV2(beforeVal);
                }
                return;
            }

            // Kiểm tra xem thứ tự tháy đổi status có đúng không
            const transition = STATUS_TRANSITIONS.find(transition => (transition.before === beforeStatus) && transition.current === currentVal);

            if (transition) {
                if(transition.current === ZODIAC_GAME_STATUSES.NONE) {

                    // Clear giá trị đặt cược cũ
                    await Service.clearUserBetting();

                } else if(transition.current === ZODIAC_GAME_STATUSES.PREPARESTART) {

                    // Khởi tạo dữ liệu cho ván game mới
                    // await Service.initializeNewGame();
                    await Service.startZodiacGame();

                } else if(transition.current === ZODIAC_GAME_STATUSES.RESULTWAITING) {
                    const transactionIdSnapshot = await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.TRANSACTION_ID).once("value");
                    
                    // gọi EndZodiacGame(GAE) để lấy kết quả ván game
                    // await Service.finishZodiacGame(transactionIdSnapshot.val());
                    await Service.endZodiacGame(transactionIdSnapshot.val());

                    // Kiểm tra xem user có trúng thưởng k và update node firebase
                    Service.handleResultBettingForUser();

                } else if(transition.current === ZODIAC_GAME_STATUSES.END) {

                    // Cập nhật list card mỗi khi kết thúc 1 ván game
                    Service.updateZodiacCards();
                    
                    // Kiểm tra nếu node isPause thì sẽ cho dừng ván game tiếp theo
                    if(await Service.isPauseGame()) {
                        Service.setStatusZodiacGame(currentVal, ZODIAC_GAME_STATUSES.PAUSE, 0);
                        return;
                    } 

                }

                Service.setStatusZodiacGame(currentVal, transition.next, transition.delay);
            } else {
                const body = "Invalid status " + "\nBefore status: " + beforeStatus + " \nCurrent status: " + currentVal;
                Service.handleError(body);
                console.log("ERROR status");
            }
        } catch (error) {
            const body = "Error: " + error + "\nStatus: " + currentVal;
            Service.handleError(body);
            console.log("ERROR" + " Status " + currentVal);
            Service.setStatusZodiacGameV2(ZODIAC_GAME_STATUSES.RETRY);
        } finally {
            // Giải phóng khóa sau khi hoàn thành công việc
            console.log("Stop LOCK: " + new Date().toString())
            LOCK_CHANGE_ZODIAC_GAME_STATUS.leave();
        }
    });
    console.log("Stop handle status: " + new Date().toString())
});


exports.RemoveInactiveUser = functions.pubsub.schedule('every 10 minutes').onRun(async (context) => {
    try {

        const currentTime = new Date().getTime();
        const playersSnapshot = await REF_ZODIAC_GAME.child(PLAYERS).once('value');
        
        if (playersSnapshot.exists()) {
            playersSnapshot.forEach((playerSnapshot) => {
                const lastUpdate = playerSnapshot.child(PLAYERS_FBID_CHILDREN.LAST_UPDATE).val();
                const oneHourAgo = currentTime - (1000 * 10 * 1);
                if (!lastUpdate || lastUpdate < oneHourAgo) { // 1 hour in milliseconds
                    // Service.callExitGame(playerSnapshot.key);
                    REF_ZODIAC_GAME.child(PLAYERS).child(playerSnapshot.key).remove()
                    .then(() => console.log(`Removed inactive player: ${playerSnapshot.key}`))
                    .catch(error => console.error(`Failed to remove player ${playerSnapshot.key}:`, error));
                }
            });
        }
    } catch (error) {
        console.error('Error removing inactive users:', error);
    }
})

exports.CheckZodiacGame = functions.pubsub.schedule('every minute').onRun(async (context) => {
    try {

        const currentTime = new Date().getTime();
        const statusSnapshot = await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.STATUS).once('value');
        const lastUpdateStatusSnapshot = await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.LAST_UPDATE_STATUS).once('value');

        let statusValue = statusSnapshot.val();
        let lastUpdateStatusValue = lastUpdateStatusSnapshot.val();

        if(statusValue == null) {
            await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.STATUS).set(ZODIAC_GAME_STATUSES.NONE);
            return;
        }

        if(lastUpdateStatusValue == null) {
            await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.LAST_UPDATE_STATUS).set(currentTime);
            return;
        }


        let flagCheck = false;
        if(statusValue === ZODIAC_GAME_STATUSES.COUNTDOWN) {
            if(currentTime - lastUpdateStatusValue > 1000 * 60) {
                flagCheck = true;
            }
        } else if(statusValue !== ZODIAC_GAME_STATUSES.PAUSE) {
            if(currentTime - lastUpdateStatusValue > 1000 * 40) {
                flagCheck = true;
            }
        } else if(statusValue === ZODIAC_GAME_STATUSES.PAUSE) {
            const isPause = await Service.isPauseGame();
            if(!isPause) {
                Service.setStatusZodiacGameV2(ZODIAC_GAME_STATUSES.NONE);
                let message = "*CheckZodiacGame* \nGame bắt đầu chạy lại sau trạng thái PAUSE";
                Service.sendMessageToSlack(ZODIAC_GAME_SLACK_CHANEL, message);
            }
        } else {
            let body = "Undefined " + statusValue;
            Service.handleError(body)
        }

        if(flagCheck) {
            let body = "Game bị dừng tại status " + statusValue 
            + "\nCurrent time: " + new Date(currentTime).toString()
            + "\nLast time update: " + new Date(lastUpdateStatusValue).toString();

            Service.handleError(body);
            Service.setStatusZodiacGameV2(ZODIAC_GAME_STATUSES.RETRY);
        }

    } catch (error) {
        console.error('Error check status:', error);
    }
})

exports.SuggestZodiacCardByTopUser =  functions.database.ref(ZODIAC_GAME + "/" + PLAYERS_BETTING  + "/{facebookId}/" + PLAYERS_FBID_CHILDREN.BETTING_CARDS).onWrite(async (change, context) => {
    const afterData = change.after.val(); 
    const facebookId = context.params.facebookId;
    try {
        if(afterData ) {
            const reftopUser = REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.TOP_USERS);
            const topUsersSnapshot = await reftopUser.once("value");
            const topUsers = topUsersSnapshot.val();
            if(topUsers) {
                for (const topUserId in topUsers) {
                    const topUser = topUsers[topUserId];
                    if (topUser.facebookUserId === facebookId) {
                        const playerBettingCard = afterData;
                        const updateData = {
                            "bettingCards": playerBettingCard
                        };
                        await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.TOP_USERS).child(topUserId).update(updateData);
                        break;
                    }
                }
            
            } else {
                console.error("Top user is empty")
            }
        } else {
            console.error("afterData is empty");
        }
    } catch (error) {
        console.error('Error check status:', error);
    }
})

exports.ClearTopUserDaily = functions.pubsub.schedule('0 0 * * *')
  .timeZone('Asia/Ho_Chi_Minh')
  .onRun(async (context) => {
    try {
      await REF_TOP_USER.remove();
      console.log("topUser node cleared successfully");
    } catch (error) {
      console.error("Error clearing topUser node:", error);
    }
  });


