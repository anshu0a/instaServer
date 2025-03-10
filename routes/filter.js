
const user = require("../schema/newUserSchema.js");

module.exports = {

    allBadge: async (req, res) => {
        const wht = req.params.nax;

        try {
            let data;

            if (wht === "badge") {

                data = await user.aggregate([
                    { $group: { _id: "$badge.msg" } },
                    { $sort: { _id: 1 } }
                ]);
            }

            if (!data) {
                return res.status(400).send({
                    message: "Invalid request parameter",
                    color: "red"
                });
            }


            res.send({ data: data, userid: req.user._id });
        } catch (error) {
            console.error("Server-side error:", error);

            res.status(500).send({
                message: "Server-side error",
                color: "red"
            });
        }
    },
    searchFilter: async (req, res) => {
        const { Badge, Name, Username, Gender, Birthday, Relationship } = req.body;
    
        let que = {};
    
        try {
    
            if (Username && Username.length > 0) {
                que.username = {
                    $regex: new RegExp(`^[${Username.toString().replaceAll(",", "")}]`, "i")
                };
            }
    
            if (Name && Name.length > 0) {
                que.fname = {
                    $regex: new RegExp(`^[${Name.toString().replaceAll(",", "")}]`, "i")
                };
            }
    
            if (Badge && Badge.length > 0) {
                que["badge.msg"] = {
                    $regex: Badge.toString().replaceAll(",", "|"),
                };
            }
    
            if (Relationship && Relationship.length > 0) {
                que["relationship.typ"] = {
                    $regex: Relationship.toString().replaceAll(",", "|"),
                    $options: "i"
                };
            }
    
            if (Gender && Gender.length > 0) {
                que["gender.value"] = {
                    $regex: Gender.toString().replaceAll(",", "|"),
                    $options: "i"
                };
            }
    
    
            let d = [], m = [], y = [];
            if (Array.isArray(Birthday)) {
                Birthday.forEach((itm) => {
                    if (itm.startsWith("M")) m.push(itm.slice(1));
                    else if (itm.startsWith("D")) d.push(itm.slice(1));
                    else if (itm.startsWith("Y")) y.push(itm.slice(1));
                });
    
                if (d.length > 0) {
                    que.$expr = que.$expr || {};
                    que.$expr.$and = que.$expr.$and || [];
                    que.$expr.$and.push({
                        $in: [{ $dayOfMonth: { $toDate: "$birthdate.datex" } }, d.map(Number)]
                    });
                }
    
                if (m.length > 0) {
                    que.$expr = que.$expr || {};
                    que.$expr.$and = que.$expr.$and || [];
                    que.$expr.$and.push({
                        $in: [{ $month: { $toDate: "$birthdate.datex" } }, m.map(Number)]
                    });
                }
    
                if (y.length > 0) {
                    que.$expr = que.$expr || {};
                    que.$expr.$and = que.$expr.$and || [];
                    que.$expr.$and.push({
                        $in: [{ $year: { $toDate: "$birthdate.datex" } }, y.map(Number)]
                    });
                }
            }
    
    
            const data = await user.find(que).select("username pic fname");
    
    
            if (data.length === 0) {
                return res.send({
                    message: "No matching records found",
                    color: "orange"
                });
            }
            res.send(data);
    
        } catch (error) {
            console.error("Error in /applyFilter route:", error);
            res.status(500).send({
                message: "Server-side error",
                color: "red"
            });
        }
    }
}