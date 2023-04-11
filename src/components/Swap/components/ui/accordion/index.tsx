import React, { useRef, useState } from 'react'
import { BsChevronBarExpand, BsChevronDown, BsChevronUp } from 'react-icons/bs'

interface AccordionProps {
  title: React.ReactNode
  content: React.ReactNode
}

export const Accordion: React.FC<AccordionProps> = ({ title, content }) => {
  const [active, setActive] = useState(false)

  const contentSpace = useRef(null)

  function toggleAccordion() {
    setActive((prevState) => !prevState)
  }

  return (
    <div className="flex flex-col justify-end">
      <button
        className="pb-2 box-border appearance-none cursor-pointer focus:outline-none flex items-center justify-end"
        onClick={toggleAccordion}
      >
        <p className="inline-block text-footnote text-gray-400 light">{title}</p>
        {active ?
        <BsChevronUp className='text-white ml-2' />    
        :
        <BsChevronDown className='text-white ml-2'/>
        }
      </button>
    
        {active && 
        <div className="pb-10">
            {content}
        </div>
        }
    </div>
  )
}