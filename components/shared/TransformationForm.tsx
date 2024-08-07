"use client" // because it has to manage keyboard and key press and submit events

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { aspectRatioOptions, defaultValues, transformationTypes } from "@/constants"
import { CustomField } from "./CustomField"
import { AspectRatioKey } from "@/lib/utils"
import { useState } from "react"

export const formSchema = z.object({
    title: z.string(),
    aspectRation: z.string().optional(),
    color: z.string().optional(),
    prompt: z.string().optional(),
    publicId: z.string(),
})

const TransformationForm = ({ action, data = null, userId, type, creditBalance }: TransformationFormProps) => {
    const transformationType = transformationTypes[type]; // keeping track of type of transformation
    const [image, setImage] = useState(data) // keeping track of image
    const [newTransformation, setNewTransformation] = useState<Transformations | null>(null); // keep track of new transf

    const initialValues = data && action === 'Update' ? {
        title: data?.title,
        aspectRatio: data?.aspectRation,
        color: data?.color,
        prompt: data?.prompt,
        publicId: data?.publicId,
    } : defaultValues
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialValues,
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {

    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <CustomField
                    control={form.control}
                    name="title"
                    formLabel="Image Title"
                    className="w-full"
                    render={({ field }) => <Input {...field}
                        className="input-field" />}
                />

                {type === 'fill' && (
                    <CustomField
                        control={form.control}
                        name="aspectRatio"
                        formLabel="Aspect Ratio"
                        className="w-full"
                        render={({ field }) => (
                            <Select
                                onValueChange={(value) => onSelectFieldHandler(value, field.onChange)}
                                value={field.value}
                            >
                                <SelectTrigger className="select-field">
                                    <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(aspectRatioOptions).map((key) => (
                                        <SelectItem key={key} value={key} className="select-item">
                                            {aspectRatioOptions[key as AspectRatioKey].label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                )}
            </form>
        </Form>
    )
}

export default TransformationForm
