import axios, {AxiosInstance } from 'axios';
import { Reference } from 'firebase-admin/database';
import { Firestore } from 'firebase-admin/firestore';

const admin = require('firebase-admin');
const semaphore = require('semaphore');


export const ZODIAC_GAME_SLACK_CHANEL = "C07DJ6J7HLH";



// export const GAE_DOMAIN = "https://mascot.lumitel.bi";
export const GAE_DOMAIN = "https://154.117.220.30"
export const GAE_API = {
    ZODIAC_CARD_LIST: "/api/zodiac-card/list",
    ZODIAC_GAME_JOIN_GAME: "/api/mascot/join-game",
    ZODIAC_GAME_EXIT_GAME: "/api/mascot/exit-game",
    ZODIAC_GAME_START: "/api/mascot/start",
    ZODIAC_GAME_END: "/api/mascot/end",
    ZODIAC_GAME_UPDATE_ZODIAC_CARDS: "/api/mascot/update-zodiac-cards",
    SEND_MAIL: "/cronjobs.SendEmail",
    SEND_MESSAGE_TO_SLACK: "/taskQueue.SendMessageToSlack"
};

// export const GAE_DOMAIN = 'https://ikara-development.appspot.com';

// export const GAE_API = {
//     ZODIAC_CARD_LIST: "/rest/zodiac-card/list",
//     ZODIAC_GAME_JOIN_GAME: "/rest/zodiac-game/join-game",
//     ZODIAC_GAME_EXIT_GAME: "/rest/zodiac-game/exit-game",
//     ZODIAC_GAME_START: "/rest/zodiac-game/start",
//     ZODIAC_GAME_END: "/rest/zodiac-game/end",
//     ZODIAC_GAME_UPDATE_ZODIAC_CARDS: "/rest/zodiac-game/update-zodiac-cards",
//     SEND_MAIL: "/cronjobs.SendEmail",
//     SEND_MESSAGE_TO_SLACK: "/taskQueue.SendMessageToSlack"
// };

export const FIRE_STORE: Firestore = admin.firestore()

export const REF_IKARA: Reference = admin.database().ref("/ikara")
export const USERS = "users";
export const USERS_FBID_CHILDREN = {
    NAME: "name",
    PROFILE_IMAGE_LINK: "profileImageLink"
}

export const TOP_DAY_USER = "topDayUsers"
export const REF_ZODIAC_GAME: Reference = admin.database().ref("/zodiacGame")
export const REF_TOP_USER = REF_ZODIAC_GAME.child(TOP_DAY_USER);
export const ZODIAC_GAME = "zodiacGame"
export const ZODIAC_CARDS = "zodiacCards"
export const PLAYERS = "players"
export const PLAYERS_BETTING = "playersBetting"
export const PLAYERS_FBID_CHILDREN = {
    NAME: "name",
    PROFILEIMAGE_LINK: "profileImageLink",
    LAST_UPDATE: "lastUpdate",
    BETTING_CARDS: "bettingCards",
    NO_BETTING_TODAY: "noBettingToday",
    TOTAL_ICOIN_BETTING: "totalIcoinBetting",
    TOTAL_ICOIN_WIN: "totalIcoinWin",
    IS_WIN: "isWin",
    IS_SUPPER_BETTING: "isSuperBetting",
    TOTAL_ICOIN_WIN_TODAY: "totalIcoinWinToday"
}

export const HISTORIES = "histories"

export const STATE = "state"
export const STATE_CHILDREN = {
    STATUS: "status",
    START_TIME: "startTime",
    LAST_UPDATE_STATUS: "lastUpdateStatus",
    BEFORE_STATUS: "beforeStatus",
    IS_PAUSE: "isPause",
    IS_LOCK: "isLock",
    ZODIAC_CARD: "zodiacCard",
    TRANSACTION_ID: "transactionId",
    TOP_USERS: "topUsers",
    COUNT_DOWN: "countDown",
    NO_GAME_TO_DAY: "noGameToday",
    ZODIAC_CARDS_RECENT: "zodiacCardsRecent"
}

export const ZODIAC_CARD_CHILDREN = {
    COUNTER: "counter"
}

export const ZODIAC_GAME_STATUSES = {
    NONE: "NONE",
    PREPARESTART: "PREPARESTART",
    COUNTDOWN: "COUNTDOWN",
    RESULTWAITING: "RESULTWAITING",
    RESULT: "RESULT",
    END: "END",
    PAUSE: "PAUSE",
    RETRY: "RETRY"
};

export const STATUS_TRANSITIONS = [
    { before: null, current: ZODIAC_GAME_STATUSES.NONE, next: ZODIAC_GAME_STATUSES.PREPARESTART, delay: 0 },
    { before: undefined, current: ZODIAC_GAME_STATUSES.NONE, next: ZODIAC_GAME_STATUSES.PREPARESTART, delay: 0 },
    { before: ZODIAC_GAME_STATUSES.END, current: ZODIAC_GAME_STATUSES.NONE, next: ZODIAC_GAME_STATUSES.PREPARESTART, delay: 0 },
    { before: ZODIAC_GAME_STATUSES.PAUSE, current: ZODIAC_GAME_STATUSES.NONE, next: ZODIAC_GAME_STATUSES.PREPARESTART, delay: 0 },
    { before: ZODIAC_GAME_STATUSES.NONE, current: ZODIAC_GAME_STATUSES.PREPARESTART, next: ZODIAC_GAME_STATUSES.COUNTDOWN, delay: 0 },
    { before: ZODIAC_GAME_STATUSES.PREPARESTART, current: ZODIAC_GAME_STATUSES.COUNTDOWN, next: ZODIAC_GAME_STATUSES.RESULTWAITING, delay: 40000 },
    { before: ZODIAC_GAME_STATUSES.COUNTDOWN, current: ZODIAC_GAME_STATUSES.RESULTWAITING, next: ZODIAC_GAME_STATUSES.RESULT, delay: 0 },
    { before: ZODIAC_GAME_STATUSES.RESULTWAITING, current: ZODIAC_GAME_STATUSES.RESULT, next: ZODIAC_GAME_STATUSES.END, delay: 4500 },
    { before: ZODIAC_GAME_STATUSES.RESULT, current: ZODIAC_GAME_STATUSES.END, next: ZODIAC_GAME_STATUSES.NONE, delay: 4000 },

    { before: ZODIAC_GAME_STATUSES.RETRY, current: ZODIAC_GAME_STATUSES.NONE, next: ZODIAC_GAME_STATUSES.PREPARESTART, delay: 0 },
    { before: ZODIAC_GAME_STATUSES.RETRY, current: ZODIAC_GAME_STATUSES.PREPARESTART, next: ZODIAC_GAME_STATUSES.COUNTDOWN, delay: 0 },
    { before: ZODIAC_GAME_STATUSES.RETRY, current: ZODIAC_GAME_STATUSES.COUNTDOWN, next: ZODIAC_GAME_STATUSES.RESULTWAITING, delay: 40000 },
    { before: ZODIAC_GAME_STATUSES.RETRY, current: ZODIAC_GAME_STATUSES.RESULTWAITING, next: ZODIAC_GAME_STATUSES.RESULT, delay: 0 },
    { before: ZODIAC_GAME_STATUSES.RETRY, current: ZODIAC_GAME_STATUSES.RESULT, next: ZODIAC_GAME_STATUSES.END, delay: 4500 },
    { before: ZODIAC_GAME_STATUSES.RETRY, current: ZODIAC_GAME_STATUSES.END, next: ZODIAC_GAME_STATUSES.NONE, delay: 4000 }
];


// Khởi tạo Semaphore với số lượng cấp phát là 1 (chỉ cho phép một luồng chạy tại một thời điểm)
export const LOCK_CHANGE_ZODIAC_GAME_STATUS = semaphore(1);
export const LOCK_TEST_SEMAPHORE = semaphore(1);
export const AXIOS_INSTANCE: AxiosInstance = axios.create();

export const COUNTDOWN = 40;
export const SUBJECT_ERROR_GAME = "ERROR ZODIAC GAME";
export const EMAIL = "phuoctc@inmobivn.com";