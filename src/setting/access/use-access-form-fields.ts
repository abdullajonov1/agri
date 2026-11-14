import { React } from "jimu-core";

export interface AccessFormFields {
    formTitle: string;
    setFormTitle: (value: string) => void;
    formField: string;
    setFormField: (value: string) => void;
    formGroup: string;
    setFormGroup: (value: string) => void;
}

/** Text inputs shared by the field and group dialogs. */
export function useAccessFormFields(): AccessFormFields {
    const [formTitle, setFormTitle] = React.useState<string>("");
    const [formField, setFormField] = React.useState<string>("");
    const [formGroup, setFormGroup] = React.useState<string>("");

    return { formTitle, setFormTitle, formField, setFormField, formGroup, setFormGroup };
}
