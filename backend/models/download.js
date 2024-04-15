const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);

const DownloadSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  url: {
    type: String,
    required: true
  },
});

// Apply the plugin to the schema
//DownloadSchema.plugin(autoIncrement, { inc_field: 'id', id: 'download_id_' });
const Download = mongoose.model('download', DownloadSchema);

module.exports = Download;
