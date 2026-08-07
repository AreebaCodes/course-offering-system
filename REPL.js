import { db } from "./models/index.js"

// db.Curriculum.aggregate([
//     { $lookup: { from: "courses", foreignField: "cid", localField: "cid", as: "course" } },
//     { $unwind: "$course" }, { $project: { _id: 1, curid: 1, cid: 1, title: "$course.title", semno: 1 } }]).sort('semno')
//     .then(res => console.log(JSON.stringify(res, null, 4)))
//     .then(() => process.exit())

//662e7ce83ff9e20284b3d737

// db.Faculty.aggregate([
//     {
//         $lookup: {
//             from: "offers", foreignField: "fid", localField: "fid",
//             pipeline: [{ $group: { _id: { fid: "$fid" }, count: { $count: {} } } },
//             { $project: { _id: 0, fid: "$_id.fid", assign: "$count" } }], as: 'alot'
//         }
//     },
//     { $unwind: { path: "$alot", preserveNullAndEmptyArrays: true } },
//     { $project: { _id: 1, fid: 1, TeacherName: 1, fulltime: 1, alot: "$alot.assign" } }
// ]).sort({ fid: 1 })
//     .then(res => console.log(JSON.stringify(res, null, 4)))
//     .then(() => process.exit())

db.Offer.aggregate([
    { $match: { semester: "Spring" } },
    { $group:{ _id:{ fid:"$fid", fulltime: "$fulltime" }, count: { $count: {} } } },
    { $project:{ _id: 0, fid: "$_id.fid", assign: "$count" , fulltime: 1} }
])
.then(res => console.log(JSON.stringify(res, null, 4)))
.then(() => process.exit())