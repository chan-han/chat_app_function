const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();


exports.sendStatusMessage = functions.firestore.document('buildings/{bId}/gateways/{gId}/things/{tId}').onWrite(async (change, context) => {

    const bId = context.params.bId;
    const data = change.after.data();
    const previousData = change.before.data();
    functions.logger.log('message', data);
    functions.logger.log('bid', bId);
    const users = admin.firestore().collection('users');

       let bname = await admin.firestore()
        .collection('buildings').doc(String(bId))
        .get()
        .then((doc) => {


                functions.logger.log(doc.data());



            return doc.data().bname;
        })
        .catch(err => {
        functions.logger.log('에러', err);
    });
    functions.logger.log('건물이름', bname);

    const payload = {
        notification: {
            'title': '화재발생',
            'body': String(bname)
        }

    };


    await users.get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                functions.logger.log('doc.id', doc.id);
                    const pushToken = doc.data().token;
                    functions.logger.log('토큰값, 보내는 메세지', pushToken, payload);

                     admin.messaging().sendToDevice(pushToken, payload);

            });
            return '모든 유저에게 보내는 메세지 입니다.';
        })
        .catch(err => {
            functions.logger.log('에러', err);
        });


});