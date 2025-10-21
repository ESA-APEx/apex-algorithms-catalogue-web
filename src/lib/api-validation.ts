interface DateValidationResult {
  success: boolean;
  startDate?: Date;
  endDate?: Date;
  errorResponse?: Response;
}

export function validateDateParameters(
  startDateParam: string | null,
  endDateParam: string | null,
): DateValidationResult {
  const errorResponseHeader = {
    status: 400,
    headers: { "Content-Type": "application/json" },
  };

  const today = new Date();
  today.setHours(23, 59, 59, 999); // Set to end of today for comparison

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (startDateParam) {
    const parsedStartDate = new Date(startDateParam + "T00:00:00");
    if (isNaN(parsedStartDate.getTime())) {
      return {
        success: false,
        errorResponse: new Response(
          JSON.stringify({
            message: "Invalid start date format. Use YYYY-MM-DD.",
          }),
          errorResponseHeader,
        ),
      };
    }
    if (parsedStartDate > today) {
      return {
        success: false,
        errorResponse: new Response(
          JSON.stringify({
            message: "Start date cannot be in the future.",
          }),
          errorResponseHeader,
        ),
      };
    }
    startDate = parsedStartDate;
  }

  if (endDateParam) {
    const parsedEndDate = new Date(endDateParam + "T23:59:59.999");
    if (isNaN(parsedEndDate.getTime())) {
      return {
        success: false,
        errorResponse: new Response(
          JSON.stringify({
            message: "Invalid end date format. Use YYYY-MM-DD.",
          }),
          errorResponseHeader,
        ),
      };
    }
    endDate = parsedEndDate;

    if (endDate > today) {
      return {
        success: false,
        errorResponse: new Response(
          JSON.stringify({
            message: "End date cannot be in the future.",
          }),
          errorResponseHeader,
        ),
      };
    }

    if (!startDate) {
      return {
        success: false,
        errorResponse: new Response(
          JSON.stringify({
            message: "Start date is required when end date is provided.",
          }),
          errorResponseHeader,
        ),
      };
    }

    if (endDate <= startDate) {
      return {
        success: false,
        errorResponse: new Response(
          JSON.stringify({
            message: "End date must be later than start date.",
          }),
          errorResponseHeader,
        ),
      };
    }
  }

  return {
    success: true,
    startDate,
    endDate,
  };
}
