import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";

import config from "../config.js";
import AppError from "../utilis/appError.util.js";

const { characters } = config;
const { bucket, region, accessKeyId, secretAccessKey } = config.awsS3;
const credentials = { accessKeyId, secretAccessKey };
const options = { region, apiVersion: "2006-03-01", credentials };

aws.config.update(options);

const s3 = new aws.S3();

function randomString(length) {
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++)
    result += characters.charAt(Math.floor(Math.random() * charactersLength));

  return result;
}

const fileFilter = (allowedTypes) => (_req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype))
    return cb(
      new AppError(`File type must be ${allowedTypes.join(", ")}`, 422),
      false
    );
  return cb(null, true);
};

const storageS3 = (folder) =>
  multerS3({
    s3,
    bucket,
    acl: "public-read",
    contentDisposition: "inline",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (_req, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (_req, file, cb) => {
      const name = `${folder}/${new Date().toISOString()}${randomString(10)}${file.originalname}`;
      cb(null, name);
    },
  });

const UploadService = {
  uploadS3({
    maxSize = 200,
    folder = "chef/images",
    allowedTypes = ["image/jpeg", "image/png", "image/jpg"],
  }) {
    const limits = { fileSize: 1024 * 1024 * maxSize };

    return multer({
      storage: storageS3(folder),
      fileFilter: fileFilter(allowedTypes),
      limits,
    });
  },

  deleteFile({ key }) {
    if (!key) return;

    const Key = key
      .replace(`https://${bucket}.s3.amazonaws.com/`, "")
      .replaceAll("%3A", ":");
    const params = { Bucket: bucket, Key };
    // eslint-disable-next-line no-console
    s3.deleteObject(params, (err, data) =>
      console.log("deleteFile", Key, err, data)
    );
  },

  deleteFiles(req) {
    const { file = {}, files } = req;

    this.deleteFile({ key: file.key });

    if (Array.isArray(files))
      for (const item of files) this.deleteFile({ key: item?.key });
    else {
      for (const key in files || {}) {
        if (Object.hasOwnProperty.call(files, key)) {
          for (const item of files[key] || [])
            this.deleteFile({ key: item?.key });
        }
      }
    }
  },
};

export default UploadService;
