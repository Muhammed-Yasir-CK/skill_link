import { ethers } from "ethers";
import WorkEscrowABI from "../contracts/WorkEscrowABI.json";
import { getValidToken } from "./authToken";

// Replace with your actual deployed contract address on Polygon
const CONTRACT_ADDRESS = "0x9866F0236A5405d2A537FEC74086481feF2572c4";

const API_BASE = "http://localhost:8000/api/accounts";

// Helper to call backend relay
const relayTransaction = async (to, data, value = "0") => {
    // Demo Mode: Skip real blockchain tx if contract isn't deployed yet
    if (to === "0xYourDeployedContractAddressPlaceholder") {
        console.warn("[Blockchain] Simulation Mode: No real contract address provided. Returning mock success.");
        return {
            tx_hash: `0x_mock_tx_${Date.now()}`,
            receipt: {
                logs: [{
                    // Simulated CreateAgreement Log
                    topics: [ethers.id("AgreementCreated(uint256,address,address,uint256)")],
                    data: ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [Math.floor(Math.random() * 1000)])
                }]
            }
        };
    }

    const token = await getValidToken();
    const response = await fetch(`${API_BASE}/relay-transaction/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            tx: { to, data, value }
        })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || "Relay failed");
    return result;
};

export const blockchainService = {
    /**
     * Creates a new agreement. Supports both External and Managed wallets.
     */
    createAgreement: async (seekerAddress, amount) => {
        try {
            const amountWei = ethers.parseEther(amount.toString()).toString();
            const iface = new ethers.Interface(WorkEscrowABI);
            const data = iface.encodeFunctionData("createAgreement", [seekerAddress, amountWei]);

            const result = await relayTransaction(CONTRACT_ADDRESS, data);

            // Parse receipt logs to get agreement ID
            if (result.receipt && result.receipt.logs) {
                const eventLog = result.receipt.logs.find(log => {
                    try {
                        const decoded = iface.parseLog(log);
                        return decoded && decoded.name === 'AgreementCreated';
                    } catch (e) { return false; }
                });

                if (eventLog) {
                    const decodedEvent = iface.parseLog(eventLog);
                    return {
                        success: true,
                        onChainId: Number(decodedEvent.args.id),
                        txHash: result.tx_hash
                    };
                }
            }

            return { success: true, txHash: result.tx_hash };
        } catch (error) {
            console.error("[Blockchain] Creation error:", error);
            throw error;
        }
    },

    fundAgreement: async (id, amount) => {
        try {
            const amountWei = ethers.parseEther(amount.toString()).toString();
            const iface = new ethers.Interface(WorkEscrowABI);
            const data = iface.encodeFunctionData("fundAgreement", [id]);

            const result = await relayTransaction(CONTRACT_ADDRESS, data, amountWei);
            return { success: true, txHash: result.tx_hash };
        } catch (error) {
            console.error("[Blockchain] Funding error:", error);
            throw error;
        }
    },

    markCompleted: async (id) => {
        try {
            const iface = new ethers.Interface(WorkEscrowABI);
            const data = iface.encodeFunctionData("markCompleted", [id]);

            const result = await relayTransaction(CONTRACT_ADDRESS, data);
            return { success: true, txHash: result.tx_hash };
        } catch (error) {
            console.error("[Blockchain] Completion error:", error);
            throw error;
        }
    },

    releaseFunds: async (id) => {
        try {
            const iface = new ethers.Interface(WorkEscrowABI);
            const data = iface.encodeFunctionData("releaseFunds", [id]);

            const result = await relayTransaction(CONTRACT_ADDRESS, data);
            return { success: true, txHash: result.tx_hash };
        } catch (error) {
            console.error("[Blockchain] Release error:", error);
            throw error;
        }
    }
};
