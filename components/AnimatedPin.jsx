"use client";
import React from "react";
import { PinContainer } from "./ui/3d-pin";
import Image from "next/image";

export function AnimmatedPin() {
    return (
        (<div className="h-[40rem] w-full flex items-center justify-center text-center">
            <PinContainer title="Work with me" href="mailto:hey@hectormendoza.me">
                <div
                    className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[20rem]">
                    <div className="flex justify-center mb-4 ">
                        <Image src="/profile.jpg" width={150} height={150}
                            alt="Profile Image" priority
                            className="object-contain rounded-full" />
                    </div>
                    <h3 className="max-w-xs !pb-2 !m-0 font-bold  text-2xl text-slate-100">
                        Héctor Mendoza 😅
                    </h3>
                    <div className="text-lg  !m-0 !p-0 font-normal">
                        <span className="text-white ">
                            Your friendly neighborhood developer
                        </span>
                    </div>
                </div>
            </PinContainer>
        </div>)
    );
}
