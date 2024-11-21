const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  group: {
    type: String,
    required: true,
  },
  subjects: [
    {
      subjectName: String,
      grades: [Number]
    }
  ]
});

module.exports = mongoose.model('Student', studentSchema);
