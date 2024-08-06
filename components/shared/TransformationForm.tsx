"use client" // because it has to manage keyboard and key press and submit events

import React from 'react'
import { z } from "zod"

const formSchema = z.object({
    username: z.string().min(2).max(50),
})

const TransformationForm = () => {
    return (
        <div>
            Transformation Form
        </div>
    )
}

export default TransformationForm
