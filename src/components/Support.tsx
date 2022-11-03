import { Button } from '@mui/material';

export const Support: React.FC = () => {
    return (
        <>
            <div className="spacer"></div>
            <div className="coffee">
                <Button
                    style={{ backgroundColor: 'transparent', padding: 0, borderRadius: 8 }}
                    href="https://www.buymeacoffee.com/grabofus"
                >
                    <img alt="Buy me a coffee" width="200" src="./assets/coffee.png"></img>
                </Button>
            </div>
        </>
    );
};
