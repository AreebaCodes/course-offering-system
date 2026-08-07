// Run this once to populate the MongoDB "CourseFaculty" collection with the
// course-to-eligible-teacher mapping.
// Usage:  node seedCourseFaculty.js
import { db } from "./models/index.js";

const mappingData = [
    { cid: 5, fid: 68 }, { cid: 5, fid: 11 }, { cid: 5, fid: 7 }, { cid: 5, fid: 26 },
    { cid: 15, fid: 83 }, { cid: 16, fid: 33 }, { cid: 16, fid: 1 }, { cid: 16, fid: 57 },
    { cid: 16, fid: 25 }, { cid: 16, fid: 58 }, { cid: 16, fid: 35 }, { cid: 17, fid: 59 },
    { cid: 17, fid: 19 }, { cid: 15, fid: 20 }, { cid: 15, fid: 34 }, { cid: 17, fid: 14 },
    { cid: 17, fid: 5 }, { cid: 20, fid: 12 }, { cid: 20, fid: 58 }, { cid: 17, fid: 16 },
    { cid: 20, fid: 1 }, { cid: 15, fid: 6 }, { cid: 17, fid: 12 }, { cid: 5, fid: 5 },
    { cid: 20, fid: 61 }, { cid: 15, fid: 38 }, { cid: 20, fid: 39 }, { cid: 20, fid: 66 },
    { cid: 20, fid: 30 }, { cid: 18, fid: 12 }, { cid: 18, fid: 15 }, { cid: 18, fid: 17 },
    { cid: 18, fid: 36 }, { cid: 18, fid: 60 }, { cid: 14, fid: 11 }, { cid: 14, fid: 12 },
    { cid: 1, fid: 66 }, { cid: 19, fid: 12 }, { cid: 19, fid: 76 }, { cid: 19, fid: 14 },
    { cid: 19, fid: 3 }, { cid: 19, fid: 71 }, { cid: 1, fid: 57 }, { cid: 19, fid: 7 },
    { cid: 19, fid: 49 }, { cid: 19, fid: 25 }, { cid: 19, fid: 22 }, { cid: 25, fid: 12 },
    { cid: 25, fid: 70 }, { cid: 25, fid: 37 }, { cid: 25, fid: 24 }, { cid: 14, fid: 18 },
    { cid: 27, fid: 40 }, { cid: 27, fid: 6 }, { cid: 27, fid: 81 }, { cid: 27, fid: 90 },
    { cid: 27, fid: 38 }, { cid: 21, fid: 75 }, { cid: 21, fid: 10 }, { cid: 21, fid: 77 },
    { cid: 21, fid: 25 }, { cid: 30, fid: 48 }, { cid: 25, fid: 26 }, { cid: 27, fid: 12 },
    { cid: 30, fid: 42 }, { cid: 1, fid: 1 }, { cid: 1, fid: 69 }, { cid: 30, fid: 84 },
    { cid: 30, fid: 62 }, { cid: 31, fid: 55 }, { cid: 31, fid: 12 }, { cid: 31, fid: 47 },
    { cid: 31, fid: 78 }, { cid: 31, fid: 18 }, { cid: 31, fid: 43 }, { cid: 31, fid: 88 },
    { cid: 31, fid: 92 }, { cid: 1, fid: 21 }, { cid: 1, fid: 23 }, { cid: 30, fid: 41 },
    { cid: 4, fid: 48 }, { cid: 30, fid: 86 }, { cid: 29, fid: 85 }, { cid: 28, fid: 50 },
    { cid: 29, fid: 41 }, { cid: 4, fid: 87 }, { cid: 29, fid: 12 }, { cid: 28, fid: 12 },
    { cid: 28, fid: 37 }, { cid: 4, fid: 40 }, { cid: 4, fid: 29 }, { cid: 4, fid: 4 },
    { cid: 4, fid: 50 }, { cid: 4, fid: 28 }, { cid: 3, fid: 41 }, { cid: 3, fid: 3 },
    { cid: 3, fid: 6 }, { cid: 3, fid: 71 }, { cid: 3, fid: 38 }, { cid: 6, fid: 8 },
    { cid: 35, fid: 93 }, { cid: 35, fid: 26 }, { cid: 34, fid: 37 }, { cid: 35, fid: 18 },
    { cid: 3, fid: 67 }, { cid: 34, fid: 30 }, { cid: 35, fid: 89 }, { cid: 36, fid: 88 },
    { cid: 36, fid: 11 }, { cid: 36, fid: 80 }, { cid: 36, fid: 41 }, { cid: 36, fid: 38 },
    { cid: 36, fid: 7 }, { cid: 2, fid: 41 }, { cid: 35, fid: 47 }, { cid: 6, fid: 30 },
    { cid: 6, fid: 79 }, { cid: 35, fid: 91 }, { cid: 39, fid: 89 }, { cid: 39, fid: 14 },
    { cid: 40, fid: 63 }, { cid: 2, fid: 2 }, { cid: 40, fid: 64 }, { cid: 40, fid: 86 },
    { cid: 40, fid: 80 }, { cid: 40, fid: 28 }, { cid: 40, fid: 48 }, { cid: 7, fid: 12 },
    { cid: 7, fid: 52 }, { cid: 7, fid: 9 }, { cid: 7, fid: 5 }, { cid: 7, fid: 26 },
    { cid: 2, fid: 27 }, { cid: 8, fid: 7 }, { cid: 9, fid: 11 }, { cid: 8, fid: 25 },
    { cid: 9, fid: 14 }, { cid: 9, fid: 53 }, { cid: 9, fid: 79 }, { cid: 9, fid: 51 },
    { cid: 22, fid: 41 }, { cid: 2, fid: 38 }, { cid: 8, fid: 10 }, { cid: 22, fid: 6 },
    { cid: 22, fid: 7 }, { cid: 22, fid: 42 }, { cid: 37, fid: 48 }, { cid: 2, fid: 14 },
    { cid: 2, fid: 9 }, { cid: 2, fid: 25 }, { cid: 8, fid: 73 }, { cid: 37, fid: 62 },
    { cid: 37, fid: 52 }, { cid: 38, fid: 82 }, { cid: 32, fid: 31 }, { cid: 43, fid: 73 },
    { cid: 23, fid: 31 }, { cid: 23, fid: 87 }, { cid: 23, fid: 62 }, { cid: 26, fid: 31 },
    { cid: 23, fid: 7 }, { cid: 23, fid: 81 }, { cid: 24, fid: 11 }, { cid: 38, fid: 55 },
    { cid: 24, fid: 12 }, { cid: 24, fid: 30 }, { cid: 42, fid: 40 }, { cid: 45, fid: 59 },
    { cid: 24, fid: 79 }, { cid: 44, fid: 79 }, { cid: 10, fid: 54 }, { cid: 10, fid: 79 },
    { cid: 33, fid: 5 }, { cid: 41, fid: 59 }, { cid: 10, fid: 12 }, { cid: 11, fid: 31 },
    { cid: 10, fid: 72 }, { cid: 11, fid: 30 }, { cid: 11, fid: 7 }, { cid: 12, fid: 48 },
    { cid: 12, fid: 94 }, { cid: 12, fid: 69 }, { cid: 12, fid: 45 }, { cid: 12, fid: 32 },
    { cid: 33, fid: 82 }, { cid: 33, fid: 46 }, { cid: 12, fid: 56 }, { cid: 12, fid: 1 },
    { cid: 13, fid: 12 }, { cid: 13, fid: 13 }, { cid: 12, fid: 65 }, { cid: 46, fid: 40 },
    { cid: 13, fid: 74 }, { cid: 12, fid: 44 },
];

(async () => {
    try {
        await db.CourseFaculty.deleteMany({});
        await db.CourseFaculty.insertMany(mappingData);
        console.log(`Seeded ${mappingData.length} course-faculty mapping records.`);
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        process.exit();
    }
})();