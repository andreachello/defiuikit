import * as React from 'react';

interface ISwitchButtonProps {
    children: React.ReactNode,
    onSwitch: () => void
}

const SwitchButton: React.FunctionComponent<ISwitchButtonProps> = ({children, onSwitch}) => {
  return (
    <div className='absolute top-[9.7rem] left-[9.5rem]' onClick={onSwitch}>
        {children}          
    </div>
  );
};

export default SwitchButton;
