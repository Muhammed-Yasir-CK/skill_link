import { ethers } from "ethers";
import WorkEscrowABI from "../contracts/WorkEscrowABI.json";
import api from "./axios";

// Standard contract address from the web version
const CONTRACT_ADDRESS = "0x9866F0236A5405d2A537FEC74086481feF2572c4";

/**
 * Relay a transaction through the backend for managed wallets.
 */
const relayTransaction = async (to, data, value = "0") => {
    try {
        const response = await api.post('/accounts/relay-transaction/', {
            tx: { to, data, value }
        });
        return response.data;
    } catch (error) {
        console.error("[Blockchain Relay] Error:", error.response?.data || error.message);
        throw error;
    }
};

export const blockchainService = {
    /**
     * Encodes createAgreement call and relays it.
     */
    createAgreement: async (seekerAddress, amount) => {
        try {
            const amountWei = ethers.parseEther(amount.toString()).toString();
            const iface = new ethers.Interface(WorkEscrowABI);
            const data = iface.encodeFunctionData("createAgreement", [seekerAddress, amountWei]);

            const result = await relayTransaction(CONTRACT_ADDRESS, data);

            // Parse receipt logs to get agreement ID
            if (result.success && result.receipt && result.receipt.logs) {
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

    /**
     * Encodes fundAgreement call and relays it.
     */
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

    /**
     * Encodes markCompleted (Submit Work/Proof) call and relays it.
     */
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

    /**
     * Encodes releaseFunds call and relays it.
     */
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
