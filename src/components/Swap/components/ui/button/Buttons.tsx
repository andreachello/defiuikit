import * as React from 'react';

export const PrimaryButton = ({children}: {children:React.ReactNode}) => {
    return (
        <p className='mx-auto px-8 py-2 bg-violet-600 w-fit rounded-lg text-white cursor-pointer hover:bg-emerald-400'>
            {children}
        </p>
    )
}