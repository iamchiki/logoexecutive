const { createKey, fetchKeysByuserid } = require("../services/Key");
const { fetchSubscriptionByuserid } = require("../services/Subscription");
const Joi = require("joi");
const { destroyKey } = require("../services/Key");

const generateKeyPayloadSchema = Joi.object().keys({
  keyDescription: Joi.string()
    .trim()
    .required()
    .regex(/^[a-zA-Z\s]+$/u)
    .message("keyDescription must contain only alphabets"),
});

const destroyKeyPayloadSchema = Joi.object({
  keyId: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "\"keyId\" must be a valid UUID",
    "any.required": "\"keyId\" is a required field"
  }),
});

async function generateKey(req, res) {
  try {
    const { payload } = req.body;
    const { error, value } = generateKeyPayloadSchema.validate(payload);
    if (error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: "Unprocessable payload",
      });
    }
    const { userId } = req.userData;
    const subscription = await fetchSubscriptionByuserid(userId);
    const keyLimit = subscription.keyLimit;

    var keyCount = 1;
    const keysObject = (await fetchKeysByuserid(userId)) || [];
    if (keysObject != null) {
      keyCount = keysObject.length;
    }

    if (keyCount >= keyLimit) {
      return res.status(403).json({
        message:
          "Key generation limit reached. Upgrade your subscription to generate more.",
        statusCode: 403,
        error: "Forbidden",
      });
    }

    const duplicateKeyDescription =
      keysObject.length > 0 &&
      keysObject.every((keys) =>
        req.body.keyDescription.includes(keys.keyDescription)
      );

    if (duplicateKeyDescription) {
      return res.status(422).json({
        message: "Please provide a different key description",
        statusCode: 422,
        error: "Unprocessable payload",
      });
    }

    const data = {
      userId: req.userData.userId,
      keyDescription: req.body.keyDescription,
    };
    const UserKey = await createKey(data);
    const userKeyData = UserKey.data;
    if (userKeyData) {
      return res.status(200).json({
        message: "Key generated successfully!",
        statusCode: 200,
        data: userKeyData,
      });
    }
  } catch (err) {
    console.log("Location: generateKey controller", err);
    throw err;
  }
}

async function destroyKeyController(req, res) {
  try {
    const { error, value } = destroyKeyPayloadSchema.validate(req.query);
    if (error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: "Unprocessable payload",
      });
    }

    const { keyId } = value;

    const destroyed = await destroyKey(keyId);

    if (destroyed) {
      return res.status(200).json({
        message: "Key deleted successfully!",
        statusCode: 200,
      });
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  generateKey,
  destroyKeyController,
};
