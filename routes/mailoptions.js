
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function randm() {
    Math.floor(Math.random() * 10)
    return (Math.floor(Math.random() * 10) + "" + Math.floor(Math.random() * 10) + "" + Math.floor(Math.random() * 10) + "" + Math.floor(Math.random() * 10) + "" + Math.floor(Math.random() * 10))
}

module.exports = {
    sendMail: async (req, res) => {
        const myotp = randm();
        let { email, name } = req.body;
        const { type } = req.params
        const msg = req.params.type === "change" ? "for changing password" : req.params.type === "emailverify" ? "while adding new email" : type === "create" ? " while new account creation " : ""

        console.log("OTP : " + myotp);

        const mailOptions = {
            to: `${email}`,
            subject: "Your Otp (don't reply)",
            html: `
            <body style="font-family: 'Courier New', Courier, monospace;text-align: center;">
            <div style="border-radius: 10px; border: .5px solid rgb(157, 157, 157); aspect-ratio:1/1.5;"><br><br><br>
            <div style="width:100%;">
                <h1 style="width:100%;color:rgb(0, 83, 104); font-family: Verdana, Geneva, Tahoma, sans-serif;">Instax (a
                    clone website)</h1>
            </div><br><br>
            <div>
                <p>Hello! (mr/mrs) <b>${name}</b><br> this side Anshu from instax(a clone website)<br>sended your secure
                    OTP </p>
            </div><br> 
            <div>
                <h2 style="color:rgb(255, 0, 0);">${myotp}</h2>
            </div><br>
            <div>
                <p>for email verification <br> ${msg} in Anshu's instagram<br><br>we are hoping you'll not
                    share it to anyone,<br> even your family member or friends</p>
            </div>
            <br><br><br>
            <div>
                <p>for any query <a style="text-decoration: none; color:rgb(0, 110, 255)" href="tel: +916201909837">call
                        us</a></p>
            </div>
            <div style="width:80%;margin:10px 10% 0 10%; height:0; border:.5px solid red;"></div> 
            <div>
                <p style="font-size: small; color:rgb(99, 99, 99);">Our website is in beta phase</p>
            </div>
            <div>
                <p style="font-family:system-ui, 'Open Sans';font-size: 12px;">@privacy&nbsp;
                    <a style="text-decoration: none; color:rgb(0, 110, 255)"
                        href="https://www.instagram.com/who.is.anshu/?utm_source=qr&r=nametag">Instagram</a>
                </p>
            </div>
            </div>
            </body>
    `};
        try {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {

                    console.log("not send otp ______________ :" + err)
                    return res.send({ message: "Internal server error", color: "red" });
                }
            });
            return res.send({ message: "Otp send successfully", color: "green", otp: myotp });
        } catch (er) {
            console.log(er)
            res.send({ message: "server-side error", color: "red" });
        }

        return res.send({ message: "Otp send successfully", color: "green", otp: myotp });
    }
};

