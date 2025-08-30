import { NextResponse } from "next/server";



export const GET = () => {
    return NextResponse.json({
        message: "Healthy"
    }, {
        status: 200
    })
}