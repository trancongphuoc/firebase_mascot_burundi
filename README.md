
### Summary of the README Steps:
1. **Initialize the Firebase project**: Guides users through running `firebase init` to set up Firebase in their project.
2. **Navigate to the `functions` directory**: Instructs users to `cd` into the `functions` directory where the cloud functions reside.
3. **Install dependencies**: Uses `npm install` to install all required packages for the functions.
4. **Run development server**: Explains how to start the local development environment with `npm run dev`, which watches for changes and automatically reloads.
5. **Optional Deployment**: Provides a command for deploying functions to Firebase when they are ready with  `firebase deploy --only functions:{version}-{function name}` example : `firebase deploy --only functions:v11-AddMessageWaitingNumber`
6. **Check Trigger Firebase**: Sau khi chạy `npm run dev` thì hiển thị shell của firebase muốn trigger event nào thì call trigger name đó ví dụ : trigger này exports.AddMessageWaitingNumber = functions.database.ref(USERSFORDATABASE + "/{facebookId}/privateChats").onUpdate  thì gọi v11.AddMessageWaitingNumber({params: {facebookId: "FIREBASE+84815093338"}}) để trigger đó hiển thị 'Successfully invoked function.' là trigger thành công ( hiện tại trigger chưa biết cáchs test được local)
7. **Debug Visual Code &&** : 
 - step 1 : Cần cài đặt nodemon để chạy môi trường ( windows : npm instal -g nodemon và macos : sử dụng Homebrew instal node rồi npm install -g nodemon)
 - step 2 : Chạy lệnh `npm run debug` để chạy firebase simulator inspect and cập nhật function đã viết ( nếu là windows thì thay đổi script debug trong package.json `"debug": "set NODE_ENV=development && nodemon --watch src --ext js,ts,json --exe \"npm run build && firebase emulators:start --inspect-functions --only functions\"`)
 - step 3 : Ở sidebar chọn run and debug chọn Attach to Firebase Functions để attach vào simulator 
 - step 4 : Đặt các breakpoint để kiểm tra
 - step 5 : Run post man kiểm tra các function 


This README update provides clear instructions for setting up and working with Firebase Functions in a local development environment.
