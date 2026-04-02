const recordsService = require('./records.service')
const { createRecordSchema, updateRecordSchema, filterSchema } = require('./records.schema')
const { sendSuccess } = require('../../utils/response')

const createRecord = async (req, res, next) => {
  try {
    const data = createRecordSchema.parse(req.body)
    const record = await recordsService.createRecord(data, req.user.id)
    return sendSuccess(res, record, 'Record created successfully', 201)
  } catch (err) {
    next(err)
  }
}

const getAllRecords = async (req, res, next) => {
  try {
    const filters = filterSchema.parse(req.query)
    const result = await recordsService.getAllRecords(filters, req.user.role, req.user.id)
    return sendSuccess(res, result, 'Records fetched successfully')
  } catch (err) {
    next(err)
  }
}

const getRecordById = async (req, res, next) => {
  try {
    const record = await recordsService.getRecordById(req.params.id, req.user.role, req.user.id)
    return sendSuccess(res, record, 'Record fetched successfully')
  } catch (err) {
    next(err)
  }
}

const updateRecord = async (req, res, next) => {
  try {
    const data = updateRecordSchema.parse(req.body)
    const record = await recordsService.updateRecord(req.params.id, data, req.user.role, req.user.id)
    return sendSuccess(res, record, 'Record updated successfully')
  } catch (err) {
    next(err)
  }
}

const deleteRecord = async (req, res, next) => {
  try {
    await recordsService.deleteRecord(req.params.id, req.user.role, req.user.id)
    return sendSuccess(res, null, 'Record deleted successfully')
  } catch (err) {
    next(err)
  }
}

module.exports = { createRecord, getAllRecords, getRecordById, updateRecord, deleteRecord }