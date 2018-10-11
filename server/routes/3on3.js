import fs from "fs";
import async from "async";
import crypto from "crypto";
import _ from "lodash";
import common from "../lib";
import admin from "firebase-admin";
import moment from "moment";
export const get3On3 = (req, res) => res.render("3on3.ejs");
export const post3On3 = async (req, res) => {
    const { name, email } = req.body;
    const ref = admin.database().ref("3on3");
    ref
        .orderByChild("email")
        .equalTo(email)
        .on("value", async snapshot => {
            if (snapshot.val()) {
                res.json("Already signed up");
            } else {
                try {
                    await ref.push({ name, email });
                    res.json("success");
                } catch (err) {
                    res.json(err.message);
                }
            }
        });
};
