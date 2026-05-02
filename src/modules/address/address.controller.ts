import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  createAddressService,
  getUserAddressesService,
  getSingleAddressService,
  updateAddressService,
  deleteAddressService,
  setDefaultAddressService,
  getAllAddressesAdminService,
} from "./address.service";

export const createAddress = catchAsync(async (req: Request, res: Response) => {
  const address = await createAddressService(req.user!.id, req.body);
  sendResponse(res, 201, true, "Address created", address);
});

export const getUserAddresses = catchAsync(async (req: Request, res: Response) => {
  const addresses = await getUserAddressesService(req.user!.id);
  sendResponse(res, 200, true, "Addresses fetched", addresses);
});

export const getSingleAddress = catchAsync(async (req: Request, res: Response) => {
  const address = await getSingleAddressService(req.params.id as string, req.user!.id);
  sendResponse(res, 200, true, "Address fetched", address);
});

export const updateAddress = catchAsync(async (req: Request, res: Response) => {
  const address = await updateAddressService(
    req.params.id as string,
    req.user!.id,
    req.body
  );
  sendResponse(res, 200, true, "Address updated", address);
});

export const deleteAddress = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteAddressService(req.params.id as string, req.user!.id);
  sendResponse(res, 200, true, result.message);
});

export const setDefaultAddress = catchAsync(async (req: Request, res: Response) => {
  const address = await setDefaultAddressService(req.params.id as string, req.user!.id);
  sendResponse(res, 200, true, "Default address updated", address);
});

export const getAllAddressesAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllAddressesAdminService(req.query as any);
  sendResponse(res, 200, true, "All addresses fetched", result.data, result.meta);
});