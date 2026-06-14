const Groq = require("groq-sdk");
const { z } = require("zod");
const { zodResponseFormat } = require("openai/helpers/zod");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const interviewReportSchema = z.object({
    matchScore: z.number(),
    technicalQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })),
    behavioralQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"])
    })),
    preparationPlan: z.array(z.object({
        day: z.number(),
        focus: z.string(),
        tasks: z.array(z.string())
    })),
    title: z.string()

});

async function generateInterViewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate an interview report for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Provide:
- matchScore: a score from 0-100 indicating how well the candidate matches the job
- technicalQuestions: an array of technical interview questions, each with the question, the interviewer's intention, and how to answer it
- behavioralQuestions: an array of behavioral interview questions, each with the question, the interviewer's intention, and how to answer it
- skillGaps: an array of skill gaps with severity (low/medium/high) the candidate should work on
- preparationPlan: a day-wise preparation plan with day number, focus area, and tasks for each day`;

    const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
            { role: "user", content: prompt }
        ],
        response_format: zodResponseFormat(interviewReportSchema, "interview_report")
    });

    const result = JSON.parse(response.choices[0].message.content);
    console.log(JSON.stringify(result, null, 2));
    return result;
}

module.exports = { generateInterViewReport };