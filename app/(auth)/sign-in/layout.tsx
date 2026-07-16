import React from 'react'

const AuthLayout = ({
    children
}: {
    children: React.ReactNode
}) => {
  return (
    <section className='flex flex-col h-screen item-center justify-center'>
        <div className='w-full max-w-md'>
            {children}
        </div>
    </section>
  )
}

export default AuthLayout