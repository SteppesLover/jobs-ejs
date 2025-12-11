const mongoose = require('mongoose')

const CountrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide country name'],
    maxlength: 50,
  },

  province: {
    type: Number,
    required: [true, 'Please choose a province'],
  },

  governmentType: {
    type: String,
    enum: ['Barbarian', 'Economist', 'Soldier'],
    default: 'Barbarian',
  },

  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user'],
  },
}, { timestamps: true })

module.exports = mongoose.model('Country', CountrySchema)
