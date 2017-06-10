const mongoose = require('mongoose');
const schema = mongoose.Schema;

const TtpKeySchema =  new schema({
    username: String,
    key: String
});

module.exports = mongoose.model('TtpKey', TtpKeySchema);
