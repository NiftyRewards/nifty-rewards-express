const { body, validationResult } = require("express-validator");

exports.validateBid = [
  body("address")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Address cannot be empty!")
    .bail(),
  body("amount")
    .trim()
    .not()
    .isEmpty()
    .withMessage("amount cannot be empty!")
    .bail()
    .isNumeric()
    .withMessage("amount must be a number")
    .bail(),
  body("auctionId")
    .trim()
    .not()
    .isEmpty()
    .withMessage("auctionId cannot be empty!")
    .bail()
    .isNumeric()
    .withMessage("auctionId must be a number")
    .bail(),
  body("signature")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Signature cannot be empty!")
    .bail(),
  body("discordId")
    .trim()
    .not()
    .isEmpty()
    .withMessage("discordId cannot be empty!")
    .bail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];
