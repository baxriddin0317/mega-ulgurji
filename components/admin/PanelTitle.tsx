import React from 'react'

interface props {
  title: string
}

const PanelTitle = ({title}: props) => {
  return (
    <div className="flex flex-wrap justify-between gap-3 p-4">
      <h1 className="text-black capitalize text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">{title}</h1>
    </div>
  )
}

export default PanelTitle