import * as React from 'react';

interface IRadioProps {
    children: React.ReactNode,
    onChange: (e: React.ChangeEvent<HTMLFormElement>) => void
}
interface IRadioButtonProps {
    children: React.ReactNode,
    value: number,
    checked?: boolean
}

export const RadioGroup: React.FunctionComponent<IRadioProps> = ({children, onChange}) => {
  return (
    <form onChange={(e: React.ChangeEvent<HTMLFormElement>) => onChange(e)}>
        {children}
    </form>  
  );
};

export const RadioButton: React.FunctionComponent<IRadioButtonProps> = ({value, children, checked}) => {
    const isChecked = checked ? true : false
    return (
        <div className="flex items-center mb-4">
            <input defaultChecked={isChecked} id="default-radio-1" type="radio" value={value} name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor="default-radio-1" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                {children}
            </label>
        </div>
    )
}



