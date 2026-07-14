import { AiAnswerCard } from "@/features/qa/components/AiAnswerCard";

interface AIAnswerProps {
  questionId: number;
  question: string;
}

/**
 * Backwards-compatible wrapper — the implementation moved to
 * src/features/qa/components/AiAnswerCard.tsx.
 */
const AIAnswer = ({ questionId, question }: AIAnswerProps) => (
  <AiAnswerCard questionId={questionId} question={question} />
);

export default AIAnswer;
