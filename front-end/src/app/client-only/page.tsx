'use client'

import { AsyncComponent } from "../suspense/shared"

export default function Page () {
    return <AsyncComponent time={3000} />
}