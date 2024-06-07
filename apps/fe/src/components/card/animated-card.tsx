'use client';

import { Card } from 'antd';
import { useInView } from 'react-intersection-observer';
import { useEffect, useRef, useState } from 'react';

const { Meta } = Card;

export type CardData = {
    icon: React.ReactNode;
    title: string;
    description: string;
};

export const AnimatedCard = ({ data }: { data: CardData }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [animationDirection, setAnimationDirection] = useState<'up' | 'down'>('up');
    const prevScrollY = useRef(0);
    const { ref } = useInView({
        threshold: 0.2,
        onChange: (inView) => {
            if (inView) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        },
    });

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > prevScrollY.current) {
                setAnimationDirection('down');
            } else {
                setAnimationDirection('up');
            }
            prevScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Card
            ref={ref}
            style={{
                marginTop: '20px',
                maxWidth: '80%',
                justifyContent: 'center',
                marginLeft: 'auto',
                marginRight: 'auto',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
                transform: isVisible
                    ? 'translateY(0)'
                    : `translateY(${animationDirection === 'down' ? '20px' : '-20px'})`,
            }}
        >
            <Meta avatar={data.icon} title={data.title} description={data.description} />
        </Card>
    );
};

export default AnimatedCard;
