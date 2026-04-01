import React from 'react';

const iframeStyle: React.CSSProperties = {
    border: 0,
    display: 'block',
    height: '100%',
    width: '100%',
};

const wrapperStyle: React.CSSProperties = {
    backgroundColor: '#0b0e18',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
};

const DDTraderIframeApp = () => (
    <main style={wrapperStyle}>
        <iframe
            allow="fullscreen; clipboard-read; clipboard-write"
            loading="eager"
            src="https://ddtrader.netlify.app/"
            style={iframeStyle}
            title="DD Trader"
        />
    </main>
);

export default DDTraderIframeApp;