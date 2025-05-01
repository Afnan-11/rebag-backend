// export const PORT = isNaN(process.env.PORT) ? 3000 : parseInt(process.env.PORT);
import { z, ZodError } from "zod";
// this is zod example
// const ageSchema = z.number().min(18).max(60).int();
// const userAge = 20;
// const { data, error, success } = ageSchema.safeParse(userAge);
// // console.log("this is error:", error.issues[0].message);
// console.log("this is status:", success);
// console.log("this is the given data:", data);

// this is 2nd example to test
// try {
//   const checkUserAge = ageSchema.parse(userAge);
//   console.log(checkUserAge);
// } catch (error) {
//   if (error instanceof ZodError) {
//     console.log(error.issues[0].message);
//   } else {
//     console.log("Expection:", error);
//   }
// }

// setting PORT here
const portSchema = z.coerce.number().min(1).max(65535).default(3000);
export const PORT = portSchema.parse(process.env.PORT);
