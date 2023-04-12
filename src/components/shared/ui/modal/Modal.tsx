import React from "react"

interface ModalProps {
    shouldShow: boolean,
    title: string,
    children: React.ReactNode,
    onRequestClose: () => void
}

const Modal = ({shouldShow, title, children, onRequestClose}:ModalProps) => {

	return shouldShow ? (
        <>
        <div
        onClick={() => onRequestClose()}
        className="justify-center flex overflow-x-hidden h-fit overflow-y-hidden fixed top-20 inset-0 z-50 outline-none focus:outline-none">
          <div className="relative w-auto my-6 mx-auto max-w-3xl" onClick={e => e.stopPropagation()}>
              <div className="border-0 w-[29rem] rounded-lg shadow-lg relative flex flex-col bg-[#2d2d2f] outline-none focus:outline-none">
              {/*header*/}
              <div className="flex text-white p-5 border-b border-solid border-gray-600 rounded-t" onClick={e => e.stopPropagation()}>
                    <h3 className="text-2xl font-semibold text-center w-full">
                      {title}
                    </h3>
                    <button
                      className="p-1 ml-auto bg-transparent border-0 text-white float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                      onClick={() => onRequestClose()}
                    >
                      <span className=" h-6 w-6 text-2xl block ">
                        ×
                      </span>
                    </button>
                </div>
                  {/* Content */}
                  <div className="relative p-6 flex-auto">
                  {children}
                  </div>
      </div>
          </div>
        </div>
        <div className="opacity-40 fixed inset-0 z-40 bg-[#1c1c1d]"></div>
        </>
		) : null
}

export default Modal