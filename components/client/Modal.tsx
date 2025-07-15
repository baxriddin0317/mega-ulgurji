"use client";
import useCartProductStore from "@/store/useCartStore";
import { useOrderStore } from "@/store/useOrderStore";
import { Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/authStore";

interface props {
  setOpen: Dispatch<SetStateAction<boolean>>;
}

interface OrderFormData {
  firstName: string;
  phoneNumber: string;
}

const SubmitModal = ({ setOpen }: props) => {
  const [loading, setLoading] = useState(false);
  const { cartProducts, totalPrice, totalQuantity, clearBasket } = useCartProductStore();
  const { addOrder } = useOrderStore();
  const navigate = useRouter();
  const { userData } = useAuthStore();
  
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      firstName: userData?.name || "",
      phoneNumber: userData?.phone || ""
    }
  });

  // Phone number formatting (from SignUpForm)
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.startsWith("998")) {
      value = value.slice(3);
    }
    value = value.slice(0, 9);
    if (!value) {
      setValue("phoneNumber", "");
      return;
    }
    const formattedValue = value
      ? `+998 (${value.slice(0, 2)}${value.length > 2 ? ")" : ""}${value.length > 2 ? " " : ""}${value.slice(2, 5)}${value.length > 5 ? "-" : ""}${value.slice(5, 7)}${value.length > 7 ? "-" : ""}${value.slice(7)}`
      : "";
    setValue("phoneNumber", formattedValue);
  };

  // Form submit
  const onSubmit = async (data: OrderFormData) => {
    if (cartProducts.length === 0) {
      return toast.error("Savat bo'sh.");
    }
    const submitData = {
      id: "",
      clientName: data.firstName,
      clientPhone: data.phoneNumber,
      date: Timestamp.now(),
      basketItems: cartProducts,
      totalPrice: totalPrice,
      totalQuantity: totalQuantity,
      userUid: userData?.uid || "",
    };
    try {
      setLoading(true);
      await addOrder(submitData);
      await fetch('/api/sendOrderEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      clearBasket();
      setLoading(false);
      toast.success("Buyurtma muvaffaqiyatli qo'shildi");
      navigate.push("/");
    } catch (error) {
      setLoading(false);
      toast.error("Buyurtma qo'shilmadi");
      console.log(error);
    }
  };

  return (
    <div className="fixed z-99 w-full h-full inset-0 flex items-center justify-center">
      <div
        onClick={() => setOpen(false)}
        className="absolute inset-0 size-full bg-black/80 z-0"
      ></div>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm w-full bg-white rounded-md space-y-3 p-5 z-10">
        <div>
          <label htmlFor="first-name" className="block text-sm font-medium text-gray-900">Ism</label>
          <div className="mt-1">
            <input
              id="first-name"
              type="text"
              autoComplete="given-name"
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:outline-none focus:ring-inset focus:ring-indigo-600 sm:text-sm px-2 ${errors.firstName ? 'border-red-500 border-2' : ''}`}
              {...register("firstName", {
                required: "Ism majburiy kiritilishi kerak",
                minLength: { value: 2, message: "Ism kamida 2 ta belgidan iborat bo'lishi kerak" },
                pattern: { value: /^[A-Za-z\s]+$/, message: "Ism faqat harflar va bo'sh joylardan iborat bo'lishi mumkin" }
              })}
            />
            {errors.firstName && <span className="text-red-500 text-sm mt-1">{errors.firstName.message as string}</span>}
          </div>
        </div>
        <div>
          <label htmlFor="phone-number" className="block text-sm font-medium text-gray-900">Telefon</label>
          <div className="mt-1">
            <input
              id="phone-number"
              type="text"
              placeholder="+998 (__) ___-__-__"
              className={`block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:outline-none focus:ring-inset focus:ring-indigo-600 sm:text-sm px-2 ${errors.phoneNumber ? 'border-red-500 border-2' : ''}`}
              value={watch("phoneNumber")}
              {...register("phoneNumber", {
                required: "Telefon raqami majburiy kiritilishi kerak",
                validate: (value) => {
                  const digits = value.replace(/\D/g, "");
                  return digits.length === 12 || "Telefon raqami kod bilan birga 12 ta raqamdan iborat bo'lishi kerak";
                }
              })}
              onChange={handlePhoneNumberChange}
              maxLength={20}
            />
            {errors.phoneNumber && <span className="text-red-500 text-sm mt-1">{errors.phoneNumber.message as string}</span>}
          </div>
        </div>
        <div className="pt-3">
          <Button
            variant={"default"}
            type="submit"
            className="cursor-pointer h-12 bg-black transition-all ease-in-out rounded-xl max-w-lg w-full text-white p-2"
            disabled={loading}
          >
            {loading ? <span>Yuborilmoqda...</span> : "Buyurtmani Yuborish"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SubmitModal;
