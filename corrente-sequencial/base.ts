const obj = {
    data: { name: "foo", age: 25, country: "USA", phone: "1 222 3333" },
    options: { force: true, create: false },
    operation: "UPDATE",
    source: "mazden",
};
const obj2 = {
    data: { name: "foo", age: 25, country: "USA", phone: "1 222 3333" },
    options: { force: true, create: false },
    operation: "UPDATE",
    source: "savestation",
};
const obj3 = {
    data: { name: "foo", age: 25, country: "BRA", phone: "1 222 3333" },
    options: { force: true, create: false },
    operation: "UPDATE",
    source: "pinejot",
};
const obj4 = "";
const result = Buffer.from(JSON.stringify(obj)).toString("base64");
const result2 = Buffer.from(JSON.stringify(obj2)).toString("base64");
const result3 = Buffer.from(JSON.stringify(obj3)).toString("base64");
const result4 = Buffer.from(JSON.stringify(obj4)).toString("base64");

// const revert = Buffer.from(result, "base64").toString("ascii");
// console.log(revert);

export { result, result2, result3, result4 };
