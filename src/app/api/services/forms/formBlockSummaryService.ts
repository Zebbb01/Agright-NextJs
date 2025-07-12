// src/app/api/services/forms/formBlockSummaryService.ts
import { prisma } from "@/lib/prisma";
import { FormBlockData, BlockResponseDetail } from "@/types/form";

export async function fetchFormDetailsAndResponsesForBlocksService(formId: number): Promise<FormBlockData | null> {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      options: {
        orderBy: { id: 'asc' }
      },
      responses: {
        where: { deletedAt: null },
        select: {
          id: true, // Select response ID
          userId: true, // Select user ID
          createdAt: true, // Select creation timestamp
          values: true, // Select form values
          user: { // Include user details
            select: {
              name: true,
            }
          }
        },
      },
    },
  });

  if (!form) {
    return null;
  }

  const respondedBlockNumbers: Set<number> = new Set();
  const filledCountsByLabel: { [label: string]: number } = {};
  // NEW: Store detailed response info for each block
  const blockResponseDetails: Record<number, BlockResponseDetail[]> = {};

  // Initialize all option labels to 0 count
  form.options.forEach(option => {
    filledCountsByLabel[option.label] = 0;
  });

  // Find the "Block" FormOption to get its defined options (e.g., ["1", "2", ..., "20"])
  const blockFormOption = form.options.find(
    (option) => option.label === "Block" && option.type === "Checkbox"
  );

  // Initialize blockResponseDetails for all potential block numbers
  if (blockFormOption && blockFormOption.options) {
    blockFormOption.options.forEach(blockNumStr => {
      const blockNum = parseInt(blockNumStr);
      if (!isNaN(blockNum)) {
        blockResponseDetails[blockNum] = [];
      }
    });
  }

  // Iterate through each response to aggregate data
  form.responses.forEach(response => {
    form.options.forEach(option => {
      if (
        response.values &&
        typeof response.values === "object" &&
        !Array.isArray(response.values) &&
        Object.prototype.hasOwnProperty.call(response.values, option.label)
      ) {
        const value = (response.values as Record<string, unknown>)[option.label];

        // Special handling for the "Block" checkbox field
        if (option.label === "Block" && option.type === "Checkbox" && Array.isArray(value)) {
          (value as string[]).forEach(blockNumStr => {
            const blockNum = parseInt(blockNumStr);
            if (!isNaN(blockNum)) {
              respondedBlockNumbers.add(blockNum); // Add to unique set

              // Add detailed response info to the specific block
              if (!blockResponseDetails[blockNum]) {
                blockResponseDetails[blockNum] = [];
              }
              blockResponseDetails[blockNum].push({
                responseId: response.id,
                userId: response.userId,
                userName: response.user?.name || `User ${response.userId}`,
                createdAt: response.createdAt.toISOString(), // Convert Date to ISO string
              });
            }
          });
        }
        
        // General count for any non-empty value for any label
        if (value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0)) {
          filledCountsByLabel[option.label]++;
        }
      }
    });
  });

  // Determine total potential blocks for the "Block" field
  const totalPotentialBlocks = blockFormOption && blockFormOption.options
    ? blockFormOption.options.length
    : 0; // Or a default like 20 if you always expect 1-20 blocks

  const formBlockData: FormBlockData = {
    formName: form.name,
    totalBlocks: totalPotentialBlocks,
    filledBlocks: filledCountsByLabel, // General counts for each label
    options: form.options.map(opt => ({ // Ensure IDs are string for frontend consistency
      ...opt,
      id: String(opt.id),
      formId: String(opt.formId),
    })),
    respondedBlockNumbersForBlockLabel: Array.from(respondedBlockNumbers).sort((a, b) => a - b),
    blockResponseDetails: blockResponseDetails, // NEW: Detailed response info per block
  };

  return formBlockData;
}
