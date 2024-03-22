import React, { useState, useEffect } from 'react';

export default function Typewriter({ text, delay }) {

    const [currentText, setCurrentText] = useState('');

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setCurrentText((prevText) => prevText + text[currentIndex]);
                setCurrentIndex((prevIndex) => prevIndex + 1);
            }, delay);
            return () => clearTimeout(timeout);

        }

    }, [currentIndex, delay, text]);

    const textParts = currentText.split('\n');

    return (

        <span>

            {textParts.map((part, index) => (
                <span key={index}>
                    {part}
                    {index < textParts.length - 1 && (
                        <>
                            <br />
                            <br />
                        </>
                    )}
                </span>
            ))}
        </span>
    );

}
