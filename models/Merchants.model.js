const mongoose = require("mongoose");

const merchantsSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const Merchant =
  mongoose.models.Merchant || mongoose.model("Merchant", merchantsSchema);
export default Merchant;
