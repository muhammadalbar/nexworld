const SibApiV3Sdk = require("sib-api-v3-sdk");
const defaultClient = SibApiV3Sdk.ApiClient.instance;
module.exports = {
  sendEmail: async (req, res) => {
    SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey =
      process.env.SENDINBLUE_API_KEY;
    try {
      const { email, name, phone, message } = req.body;

      await new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({
        subject: "CONTACT FORM : {{params.name}}",
        sender: { email: "nexworld@metrodata.co.id", name: "Nexworld 360" },
        replyTo: { email: email, name: name },
        to: [{ name: "syarif", email: "syarif.cibatu@gmail.com" }],
        htmlContent: `
<!doctype html>
<html lang="en-US">

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Contact Form</title>
    <meta name="description" content="Appointment Reminder Email Template">
</head>
<style>
    a:hover {text-decoration: underline !important;}
</style>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px;" leftmargin="0">
    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#09063d"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #09063d; max-width:670px; margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                    <!-- Logo -->
                    <tr>
                        <td style="text-align:center;">
                          <a href="https://byge.synnexmetrodata.com" title="logo" target="_blank">
                            <img width="150" src="https://byge.synnexmetrodata.com/img/Logo.png" title="logo" alt="logo">
                          </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <!-- Email Content -->
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px; background:#0000008f; border:3px solid #ff02d4; border-radius:3px;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);padding:0 40px;">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <!-- Title -->
                                <tr>
                                    <td style="padding:0 15px; text-align:center;">
                                        <h1 style="color:#FFF; font-weight:400; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">CONTACT FORM</h1>
                                        <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; 
                                        width:100px;"></span>
                                    </td>
                                </tr>
                                <!-- Details Table -->
                                <tr>
                                    <td>
                                        <table cellpadding="0" cellspacing="0"
                                            style="width: 100%; border: 1px solid #ededed">
                                            <tbody>
                                                <tr>
                                                    <td
                                                        style="padding: 10px; border-bottom: 1px solid #ededed; border-right: 1px solid #ededed; width: 35%; font-weight:500; color:#FFF">
                                                        Name</td>
                                                    <td
                                                        style="padding: 10px; border-bottom: 1px solid #ededed; color: #fff;">
                                                        {{params.name}}</td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        style="padding: 10px; border-bottom: 1px solid #ededed; border-right: 1px solid #ededed; width: 35%; font-weight:500; color:#fff">
                                                        Email</td>
                                                    <td
                                                        style="padding: 10px; border-bottom: 1px solid #ededed; color: #fff;">
                                                        {{params.email}}</td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        style="padding: 10px; border-bottom: 1px solid #ededed; border-right: 1px solid #ededed; width: 35%; font-weight:500; color:#fff">
                                                        Phone Number</td>
                                                    <td
                                                        style="padding: 10px; border-bottom: 1px solid #ededed; color: #fff;">
                                                        {{params.phone}}</td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        style="padding: 10px; border-bottom: 1px solid #ededed; border-right: 1px solid #ededed; width: 35%; font-weight:500; color:#fff">
                                                        Whatsapp</td>
                                                    <td
                                                        style="padding: 10px; border-bottom: 1px solid #ededed; color: #fff;">
                                                        <a href="https://api.whatsapp.com/send?phone={{params.phone}}&text=Hi%20{{params.name}}!" style="background-color:#15e692; text-decoration:none; border-radius:7px; color:#fff; padding:2% " >whatsapp</a></td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        style="padding: 10px; border-right: 1px solid #ededed; width: 35%;font-weight:500; color:#fff">
                                                        Message</td>
                                                    <td style="padding: 10px; color: #fff;">{{params.message}}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                                <p style="font-size:14px; color:#fff; line-height:18px; margin:0 0 0;">&copy; <strong>https://byge.synnexmetrodata.com/</strong></p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>

`,
        params: { email, name, phone, message },
      });
      res.send(200).json({ message: `Email sent successfully` });
    } catch (err) {
      res.send(500).json({ message: `Internal Serve Error` });
    }
  },
  //   sendEmail: async (req, res) => {
  //     function sendLinkEmail(email, name, userjwt, token) {
  //       // Configure API key authorization: api-key
  //       var apiKey = defaultClient.authentications["api-key"];
  //       apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

  //       SibApiV3Sdk = defaultClient.authentications["api-key"];
  //       var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  //       var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
  //       sendSmtpEmail = {
  //         to: [
  //           {
  //             email: email,
  //             name: name,
  //           },
  //         ],
  //         templateId: 1,
  //         headers: {
  //           "X-Mailin-custom":
  //             "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
  //         },
  //       };
  //       apiInstance.sendTransacEmail(sendSmtpEmail).then(
  //         function (data) {
  //           return "Success";
  //         },
  //         function (error) {
  //           return error;
  //         }
  //       );
  //     }
  //     try {
  //       //   let emailResponse = await sendLinkEmail(
  //       //     req.body.email.toLowerCase(),
  //       //     req.body.name
  //       //   );
  //       //   res.send({ emailResponse });
  //       SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey =
  //         process.env.SENDINBLUE_API_KEY;
  //       new SibApiV3Sdk.TransactionalEmailsApi()
  //         .sendTransacEmail({
  //           subject: "Hello from the Node SDK!",
  //           sender: { email: "nexworld@metrodata.co.id", name: "Nexworld 360" },
  //           replyTo: { email: "nexworld360@gmail.com", name: "Sendinblue" },
  //           to: [{ name: "syarif", email: "syarif.cibatu@gmail.com" }],
  //           htmlContent:
  //             "<html><body><h1>This is a transactional email {{params.bodyMessage}}</h1></body></html>",
  //           params: { bodyMessage: "Made just for you!" },
  //         })
  //         .then(
  //           function (data) {
  //             console.log(data);
  //           },
  //           function (error) {
  //             console.error(error);
  //           }
  //         );
  //     } catch (err) {
  //       res.status(500).json({ message: `Internal serve error` });
  //     }
  //   },
};
