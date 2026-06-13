const pdfParse = require("pdf-parse")
const { generateInterViewReport } = require('../services/ai.service')
const interviewReportModel = require("../models/interviewReport.model")

async function generateInterviewReportController(req, res) {
    const resumeFile = req.file

    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    const {selfDescription, jobDescription} = req.body

    const interViewReportByAi = await generateInterViewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user:req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    })
    res.status(200).json({
        message:"Interview report generated successfully",
        interviewReport
    })
}

module.exports = {generateInterviewReportController}