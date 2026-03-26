"use client";

import { useState, useRef, useEffect } from "react";
import PartTabs from "./PartTabs";
import QuestionContent from "./QuestionContent";
import RightSidebar from "./RightSideBar";
import Header from "./Header";

export default function TOEICTestInterface({
    testName,
    currentPart,
    onPartChange,
    selectedAnswers,
    onAnswerSelect,
    timeRemaining,
    testData,
    onSubmitTest,
    onExit,
    isSubmitting = false,
    isExiting = false
}) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const partList = testData.parts;

    const questions = testData.questions.filter(q => String(q.Media?.Section) === String(currentPart));

    const partCounts = partList.map(p => testData.questions.filter(q => String(q.Media?.Section) === String(p)).length);
    const cumulativeCounts = partCounts.reduce((acc, len) => {
        const prev = acc.length ? acc[acc.length - 1] : 0;
        acc.push(prev + len);
        return acc;
    }, []);

    const pendingJumpRef = useRef(null);

    const scrollToQuestionId = (globalNumber) => {
        const el = document.getElementById(`q-${globalNumber}`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            el.classList.add("ring-2", "ring-blue-200");
            setTimeout(() => el.classList.remove("ring-2", "ring-blue-200"), 900);
        }
    };

    const handleJumpToQuestion = (globalNumber) => {
        let targetPart = partList[0];
        for (let i = 0; i < cumulativeCounts.length; i++) {
            if (globalNumber <= cumulativeCounts[i]) {
                targetPart = partList[i];
                break;
            }
        }

        if (String(targetPart) !== String(currentPart)) {
            pendingJumpRef.current = globalNumber;
            onPartChange(targetPart);
        } else {
            setTimeout(() => scrollToQuestionId(globalNumber), 100);
        }
    };

    useEffect(() => {
        if (pendingJumpRef.current) {
            const id = requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                    scrollToQuestionId(pendingJumpRef.current);
                    pendingJumpRef.current = null;
                })
            );
            return () => cancelAnimationFrame(id);
        }
    }, [currentPart]);

    const handlePartChange = (part) => {
        onPartChange(part);
        setCurrentQuestion(0);
        pendingJumpRef.current = null;
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <Header testName={testName} />

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col overflow-auto">
                    <PartTabs
                        currentPart={currentPart}
                        onPartChange={part => {
                            onPartChange(part);
                            setCurrentQuestion(0);
                        }}
                        parts={partList}
                    />

                    <QuestionContent
                        part={currentPart}
                        questions={questions}
                        baseIndex={0}
                        selectedAnswers={selectedAnswers}
                        onAnswerSelect={onAnswerSelect}
                        testData={testData}
                    />
                </div>

                <RightSidebar
                    timeRemaining={timeRemaining}
                    currentPart={currentPart}
                    selectedAnswers={selectedAnswers}
                    onJumpToQuestion={handleJumpToQuestion}
                    testData={testData}
                    onSubmitTest={onSubmitTest}
                    onExit={onExit}
                    isSubmitting={isSubmitting}
                    isExiting={isExiting}
                />
            </div>
        </div>
    );
}