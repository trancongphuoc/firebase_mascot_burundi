import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';

const https = require('https');
const agent = new https.Agent({
    rejectUnauthorized: false // Bỏ qua verify SSL
});

import {
    REF_ZODIAC_GAME,
    STATE,
    STATE_CHILDREN,
    AXIOS_INSTANCE,
    PLAYERS,
    PLAYERS_FBID_CHILDREN,
    ZODIAC_GAME_STATUSES,
    GAE_DOMAIN,
    GAE_API,
    PLAYERS_BETTING,
    TOP_DAY_USER
} from "./constants"
import { User, ZodiacCard } from './model';
import QueryString from 'qs';

export function setStatusZodiacGame(currentStatus: String, nextStatus: String, milliseconds: number) {
    setTimeout(async () => {
        try {
            const updateData: { [key: string]: any } = {
                beforeStatus: currentStatus,
                status: nextStatus,
                lastUpdateStatus: Date.now()
            }

            if (nextStatus === ZODIAC_GAME_STATUSES.COUNTDOWN) {
                updateData.startTime = Date.now();
            }

            await REF_ZODIAC_GAME.child(STATE).update(updateData);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:");
        } finally {
            
        }
    }, milliseconds);
}

export async function setStatusZodiacGameV2(status: String) {
    console.log("Start setStatus " + status)

    const updateData = {
        status: status,
        lastUpdateStatus: Date.now()
    }
    await REF_ZODIAC_GAME.child(STATE).update(updateData);

    // const currentTime = new Date().getTime();
    // await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.LAST_UPDATE_STATUS).set(currentTime);
    // await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.STATUS).set(status);

}


export async function callApiByAxiosInstance(method: string, url: string, headers: any, data: any, timeout: number, retries: number) {
    try {
        console.log("Start call api: " + url)
        // Tạo một axios instance để thực hiện các yêu cầu HTTP

        // Cấu hình retry cho axiosInstance
        axiosRetry(AXIOS_INSTANCE, {
            retries: retries, // Số lần thử lại
            retryDelay: (retryCount) => retryCount * 1000, // Thời gian chờ giữa các lần thử lại (tăng dần)
            retryCondition: (error) => {
                // Điều kiện để quyết định có thử lại hay không
                // return axiosRetry.isNetworkError(error);
                console.log("RETRY")
                return true;
            }
        });

        // Cấu hình axiosInstance với các thông số truyền vào
        const config: AxiosRequestConfig = {
            method: method,
            url: url,
            headers: headers,
            data: data,
            // timeout: timeout
        };

        // Thực hiện yêu cầu HTTP và chờ kết quả
        const response: AxiosResponse<any> = await AXIOS_INSTANCE(config);
        
        // Trả về kết quả từ API
        return response.data;
    } catch (error) {
        // Xử lý các lỗi xảy ra trong quá trình gọi API
        console.error("Error calling API:", error);
        throw error; // Ném lại lỗi để xử lý ở phần gọi API
    }
}


export async function callApi(method: string, url: string, headers: any, data: any, timeout: number, retries: number) {
    console.log("Start call api: " + url)

    // Retry logic
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            let response: AxiosResponse<any>;
            if (method.toUpperCase() === "GET") {
                response = await axios.get(url, { headers, timeout, httpsAgent: agent  });
            } else if (method.toUpperCase() === 'POST') {
                response = await axios.post(url, data, { headers, timeout, httpsAgent: agent  });
            } else {
                console.error(`Unsupported method: ${method}`);
                return;  
            }
            return response.data;
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed:`, error);
            if (attempt === retries - 1) throw error;
            await new Promise(res => setTimeout(res, (attempt + 1) * 500)); // Thời gian chờ lần thử lại tiếp theo
        }
    }
}

export async function startZodiacGame() {
    console.log("Start startZodiacGame")
    try {
        const method = 'POST'; // Phương thức HTTP
        const url = GAE_DOMAIN + GAE_API.ZODIAC_GAME_START; // URL của API start
        const headers = {
            // Các header nếu cần
            'Content-Type': 'application/json'
        };
        const data = {}; // Dữ liệu truyền vào API nếu cần
        
        // Gọi API start một cách đồng bộ
        const result = await callApi(method, url, headers, data, 0, 2);
        if(result.status !== "OK") {
            console.log('Start response:', result);

            // Nếu tới lúc game mới start những game cũ chưa bắt đầu thì stop game cũ
            if(result.message == "The game in progress") {
                endZodiacGame(result.data.transactionId);
            }

            handleError("Call *StartZodiacGame* GAE Failed \nMessage: " + result.message);
            throw new Error('StartZodiacGame failed unexpectedly even with OK status' + result.message);
        }
        // Xử lý kết quả ở đây nếu cần
        return result;
    } catch (error) {
        handleError("Call *StartZodiacGame* GAE Failed");
        throw error;
    }
}


export async function endZodiacGame(transactionId: number) {
    console.log("Start endZodiacGame")
    try {
        const method = 'POST'; // Phương thức HTTP
        const url = GAE_DOMAIN + GAE_API.ZODIAC_GAME_END; // URL của API start
        const headers = {
            // Các header nếu cần
            'Content-Type': 'application/json'
        };
        const data = {zodiacGameId: transactionId}; // Dữ liệu truyền vào API nếu cần
        // Gọi API start một cách đồng bộ
        const result = await callApi(method, url, headers, data, 0, 2);
        if(result.status !== "OK") {
            console.log('Start response:', result);
            handleError("Call *StartZodiacGame* GAE Failed \nMessage: " + result.message);
            throw new Error('StartZodiacGame failed unexpectedly even with OK status' + result.message);
        }
        console.log(result);     
        return result;
    } catch (error) {
        // console.error("BUGS", error);
        handleError("Call *EndZodiacGame* GAE Failed");
        throw error;
    }
}

// export async function endZodiacGame(transactionId: number) {
//     console.log("Start endZodiacGame")
//     try {
//         const method = 'POST'; // Phương thức HTTP
//         const url = GAE_DOMAIN + GAE_API.ZODIAC_GAME_END + "/" + transactionId; // URL của API start
//         const headers = {
//             // Các header nếu cần
//             'Content-Type': 'application/json'
//         };
//         const data = {}; // Dữ liệu truyền vào API nếu cần
//         // Gọi API start một cách đồng bộ
//         const result = await callApi(method, url, headers, data, 0, 2);
//         if(result.status !== "OK") {
//             console.log('Call *EndZodiacGame* GAE Failed:', result);
//             handleError("Call *EndZodiacGame* GAE Failed \nMessage: " + result.message);
//         }        
//         return result;
//     } catch (error) {
//         handleError("Call *EndZodiacGame* GAE Failed");
//         throw error;
//     }
// }


export async function callExitGame(facebookUserId: string) {
    try {
        const method = 'POST'; // Phương thức HTTP
        const url = GAE_DOMAIN + GAE_API.ZODIAC_GAME_EXIT_GAME + "?userId=" + encodeURIComponent(facebookUserId); // URL của API start

        const data = "userId=" + facebookUserId; // Dữ liệu truyền vào API nếu cần

        const headers = {
            // Các header nếu cần
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        // Gọi API start một cách đồng bộ
        const result = await callApi(method, url, headers, data, 0, 2);
        // Xử lý kết quả ở đây nếu cần
        return result;
    } catch (error) {
        handleError("Call *JoinZodiacGame* GAE Failed");
        throw error;
    }
}

export async function addZodiacCardsRecent(zodiacCard: ZodiacCard) {
    try {
        // Lấy danh sách các zodiacCard hiện có trong zodiacCardsRecent
        const snapshot = await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.ZODIAC_CARDS_RECENT).get();
        const recentZodiacCards = snapshot.val() ? Object.values(snapshot.val()) : [];

        zodiacCard.lastUpdate = new Date().getTime();
        // Thêm zodiacCard mới vào danh sách
        recentZodiacCards.push(zodiacCard);

        // Sắp xếp danh sách theo thứ tự thời gian
        recentZodiacCards.sort((a: any, b: any) => b.lastUpdate - a.lastUpdate);

        // Chỉ giữ lại 4 zodiacCard mới nhất
        const latestZodiacCards = recentZodiacCards.slice(0, 4);

        // Cập nhật vào Firebase
        REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.ZODIAC_CARDS_RECENT).set(latestZodiacCards);
    } catch(error) {
        handleError("*Service.addZodiacCardsRecent* Failed");
        console.error('Error add zodiac cards recent:', error);
    }

}

export async function finishZodiacGame(transactionId: number) {
    console.log("Start finishZodiacGame: " + transactionId)
    const result = await endZodiacGame(transactionId);

    const zodiacCard = result?.data?.zodiacCard;

    if(zodiacCard) {
        // Lưu kết quả ván game vào node firebase cho client lắng nghe
        await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.ZODIAC_CARD).set(zodiacCard);

        addZodiacCardsRecent(zodiacCard);
    } else {
        // Nếu api không trả về kq thì xóa kết quả ván trước
        await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.ZODIAC_CARD).remove();
    }

    const topUsers = result?.data?.topUsers;
    if(topUsers && topUsers.length > 0) {
        const topUsersData: { [key: string]: User }  = {};
        
        topUsers.forEach((user: User) => {
            topUsersData[user.facebookUserId] = user;
        });
        
        REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.TOP_USERS).set(topUsersData);
    } else {
        REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.TOP_USERS).remove();
    }

    // Đã hết thời gian đặt cược. xóa TransactionId
    // await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.TRANSACTION_ID).remove();
    
}

// Hàm gọi API getListByStatus từ controller ZodiacCard
export async function getZodiacCards() {
    try {
        // Khai báo thông tin cần thiết để gọi API
        const method = 'GET'; // Phương thức HTTP
        const url = GAE_DOMAIN + GAE_API.ZODIAC_CARD_LIST; // URL của API getListByStatus


        // Gọi hàm callApi để thực hiện yêu cầu API getListByStatus một cách đồng bộ
        const result = await callApi(method, url, null, null, 0, 2);

        return result;
    } catch (error) {
        // Xử lý các lỗi xảy ra trong quá trình gọi API
        console.error("Error calling getZodiacCards API:");
        handleError("Call *GetZodiacCards* GAE Failed");
    }
}

export async function clearUserBetting() {
    try {
        console.log("Start clearUserBetting");
        const playersSnapshot = await REF_ZODIAC_GAME.child(PLAYERS).once('value');

        if (playersSnapshot.exists()) {
            const removePromises: any[] = [];
            playersSnapshot.forEach((playerSnapshot) => {
                removePromises.push(playerSnapshot.child(PLAYERS_FBID_CHILDREN.BETTING_CARDS).ref.remove());
                removePromises.push(playerSnapshot.child(PLAYERS_FBID_CHILDREN.TOTAL_ICOIN_BETTING).ref.remove());
                removePromises.push(playerSnapshot.child(PLAYERS_FBID_CHILDREN.IS_WIN).ref.remove());
                removePromises.push(playerSnapshot.child(PLAYERS_FBID_CHILDREN.TOTAL_ICOIN_WIN).ref.remove());
            });
            await Promise.all(removePromises);
        }

        await REF_ZODIAC_GAME.child(PLAYERS_BETTING).remove();
        console.log("clearUserBetting complete");
    } catch (error) {
        console.error("Error clearing user betting:");
    }
}


export async function handleResultBettingForUser() {
    console.log("Start handleResultBettingForUser")
    try {
        const [playersSnapshot, zodiacCardSnapshot, playerBettingSnapshot] = await Promise.all([
            REF_ZODIAC_GAME.child(PLAYERS).once('value'),
            REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.ZODIAC_CARD).once('value'),
            REF_ZODIAC_GAME.child(PLAYERS_BETTING).once('value')
        ])

        const zodiacCard: ZodiacCard = zodiacCardSnapshot.val();

        // let winners: Array<User> = [];
        // let user: User;
        if (playersSnapshot.exists() && zodiacCard) {
            playersSnapshot.forEach((playerSnapshot) => {
                const playerBettingCardRef = playerSnapshot.child(PLAYERS_FBID_CHILDREN.BETTING_CARDS).child(zodiacCard.id).ref;
                playerBettingCardRef.once('value', (bettingCardSnapshot) => {
                    if (bettingCardSnapshot.exists()) {
                        const bettingCard = bettingCardSnapshot.val();
                        playerSnapshot.child(PLAYERS_FBID_CHILDREN.IS_WIN).ref.set(true);

                        const totalIcoinWin = bettingCard.totalIcoinBetting * zodiacCard.multiply;
                        playerSnapshot.child(PLAYERS_FBID_CHILDREN.TOTAL_ICOIN_WIN).ref.set(totalIcoinWin);

                        // Cập nhật tổng số icoin thắng trong ngày
                        const totalIcoinBettingRef =  playerSnapshot.child(PLAYERS_FBID_CHILDREN.TOTAL_ICOIN_WIN_TODAY).ref;
                        totalIcoinBettingRef.transaction((currentValue: any) => {
                            // Nếu nút chưa tồn tại, thì giá trị khởi tạo là giá trị user đặt cược
                            if (currentValue === null) {
                                return totalIcoinWin; 
                            }
                            // Nếu nút đã tồn tại, cộng thêm giá trị user đặt cược
                            return currentValue + totalIcoinWin;
                        })

                    } else {
                        playerSnapshot.child(PLAYERS_FBID_CHILDREN.IS_WIN).ref.set(false);
                    }
                });
            }
        );
        }

        if (playerBettingSnapshot.exists() && zodiacCard) {
            playerBettingSnapshot.forEach((playerSnapshot) => {
                const playerBettingCardRef = playerSnapshot.child(PLAYERS_FBID_CHILDREN.BETTING_CARDS).child(zodiacCard.id).ref;
                playerBettingCardRef.once('value', (bettingCardSnapshot) => {
                    if (bettingCardSnapshot.exists()) {
                        const bettingCard = bettingCardSnapshot.val();
                        playerSnapshot.child(PLAYERS_FBID_CHILDREN.IS_WIN).ref.set(true);

                        const totalIcoinWin = bettingCard.totalIcoinBetting * zodiacCard.multiply;
                        playerSnapshot.child(PLAYERS_FBID_CHILDREN.TOTAL_ICOIN_WIN).ref.set(totalIcoinWin);

                        // Cập nhật tổng số icoin thắng trong ngày
                        const totalIcoinBettingRef =  playerSnapshot.child(PLAYERS_FBID_CHILDREN.TOTAL_ICOIN_WIN_TODAY).ref;
                        totalIcoinBettingRef.transaction((currentValue: any) => {
                            // Nếu nút chưa tồn tại, thì giá trị khởi tạo là giá trị user đặt cược
                            if (currentValue === null) {
                                return totalIcoinWin; 
                            }
                            // Nếu nút đã tồn tại, cộng thêm giá trị user đặt cược
                            return currentValue + totalIcoinWin;
                        }, (error, committed, snapshot) => {
                            if (error) {
                                console.error("Transaction zodiac failed: ", error);
                            } else if (committed && snapshot?.val != null) {
                                const updatedTotalIcoinWinToday = snapshot.val();
                        
                                const topUserRef = REF_ZODIAC_GAME.child(TOP_DAY_USER).child(playerSnapshot.key!);
                        
                                // Check if the user already exists in TOP_USER
                                topUserRef.once('value').then((topUserSnapshot) => {
                                    if (topUserSnapshot.exists()) {
                                        // If the user exists, update only the totalIcoinWin
                                        topUserRef.update({
                                            totalIcoinWin: updatedTotalIcoinWinToday
                                        }).then(() => {
                                            
                                        }).catch((error) => {
                                            
                                        });
                                    } else {
                                        // If the user doesn't exist, create a new entry with additional data
                                        topUserRef.set({
                                            totalIcoinWin: updatedTotalIcoinWinToday,
                                            userId: playerSnapshot.key,
                                            name: playerSnapshot.val()?.name ?? "unknown",
                                            profileImageLink: playerSnapshot.val()?.profileImageLink ?? "unknown",
                                            lastTime: new Date().getTime(),
                                        }).then(() => {
                                            console.log("New top user created successfully");
                                        }).catch((error) => {
                                            console.error("Error creating new top user: ", error);
                                        });
                                    }
                                }).catch((error) => {
                                    console.error("Error checking top user: ", error);
                                });
                            }
                        });

                        //set data for topUser in data

                    } else {
                        playerSnapshot.child(PLAYERS_FBID_CHILDREN.IS_WIN).ref.set(false);
                    }
                });
            }
        );
        }
    } catch(error) {
        console.error("Error handling result betting:", error);
        handleError("*Service.handleResultBettingForUser* GAE Failed");
    }
}

export async function updateZodiacCards() {
    try {
        const method = 'POST';
        const url = GAE_DOMAIN + GAE_API.ZODIAC_GAME_UPDATE_ZODIAC_CARDS;
        const result = await callApi(method, url, null, null, 0, 1);
    
        return result;
    } catch (error) {
        console.error("Error calling getZodiacCards API:", error);
    }
}


export async function isPauseGame() {
    const isPauseSnapshot = await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.IS_PAUSE).once("value");
    if(isPauseSnapshot.val()) {
        return true;
    } else {
        return false;
    }
}

export function setPauseNextGame() {
    REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.IS_PAUSE).set(true);
}

export function handleError(body: string) {
    try {
        sendMailErrorGame("phuoctc.2000@gmail.com", body , "Mascot");
        // sendMessageToSlack(ZODIAC_GAME_SLACK_CHANEL, body);
    } catch(error) {
        console.log("Send mail error")
    }
}

export async function sendMailErrorGame(toEmails: string, body: string, subject: string) {
    try {
        const method = 'POST'; // Phương thức HTTP
        const url = "https://www.ikara.co" + GAE_API.SEND_MAIL; // URL của API start
        const headers = {
            // Các header nếu cần
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const data = {
            toEmails: toEmails,
            body: body,
            subject: subject
        };

        const encodedData = QueryString.stringify(data); // Chuyển đổi dữ liệu thành chuỗi URL-encoded
        const result = await callApi(method, url, headers, encodedData, 0, 2);
        // Xử lý kết quả ở đây nếu cần
        return result;
    } catch (error) {
        console.error('Error send mail:');
        // Xử lý lỗi ở đây nếu cần
    }
}

export async function sendMessageToSlack(slackChanel: string, message: string) {
    try {
        const method = 'POST'; // Phương thức HTTP
        const url = GAE_DOMAIN + GAE_API.SEND_MESSAGE_TO_SLACK; // URL của API start
        const headers = {
            // Các header nếu cần
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const data = {
            slackId: slackChanel,
            message: message
        };

        const encodedData = QueryString.stringify(data); // Chuyển đổi dữ liệu thành chuỗi URL-encoded
        const result = await callApi(method, url, headers, encodedData, 0, 2);
        // Xử lý kết quả ở đây nếu cần
        return result;
    } catch (error) {
        console.error('Error send mail:', error);
        // Xử lý lỗi ở đây nếu cần
    }
}

export async function initializeNewGame() {
    console.log("Start initializeNewGame")
    // gọi StartZodiacGame(GAE) lấy TransactionID và tạo 1 node với ID đó
    const result = await startZodiacGame();
    const transactionId = result.data.transactionId;
    const noGameToday = result.data.noGameToday;
    // Lấy transaction id và lưu vào node firebase
    await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.TRANSACTION_ID).set(transactionId);
    if (noGameToday)
        await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.NO_GAME_TO_DAY).set(noGameToday);
    await REF_ZODIAC_GAME.child(STATE).child(STATE_CHILDREN.START_TIME).set(new Date().getTime());
}