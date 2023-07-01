import questionChain from "../chat/chains/question-chain";


async function main() {
  const response = await questionChain("What is a weather like in New York?");
  console.log("final response:",response.response);
  console.log("tokens used:",response.totalUsed);

  const response2 = await questionChain("How many people lives in Paris?");
  console.log("final response:",response2.response);
  console.log("tokens used:",response2.totalUsed);
}

main();