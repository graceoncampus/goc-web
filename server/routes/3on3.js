import admin from "firebase-admin";
export const get3On3 = (req, res) => res.render("3on3.ejs");
export const post3On3 = async (req, res) => {
    const { name, email } = req.body;
    const ref = admin.database().ref("3on3");
    const snapshot = await ref
        .orderByChild("email")
        .equalTo(email)
        .once("value");
    if (snapshot.val()) return res.json("Already signed up");
    try {
        await ref.push({ name, email });
        return res.json("success");
    } catch (err) {
        return res.json(err.message);
    }
};
