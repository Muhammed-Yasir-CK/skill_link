from django.shortcuts import render
from django.conf import settings

from rest_framework import generics
from .serializers import JobSeekerRegisterSerializer, CompanyRegisterSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import LoginSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import MeSerializer,CompanyProfileSerializer,CompanyDocumentSerializer,JobSeekerProfileSerializer,JobSeekerDocumentSerializer,ChangePasswordSerializer, AdminUserSerializer
from .models  import CompanyDocument,Company,JobSeekerProfile,JobSeekerDocument, CustomUser
from .razorpay_utils import create_order, verify_payment
from .blockchain_utils import fund_agreement_on_chain
from .wallet_utils import decrypt_private_key
from applications.models import WorkAgreement, JobApplication
from jobs.models import Job
from web3 import Web3

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JobSeekerRegisterView(generics.CreateAPIView):
    serializer_class = JobSeekerRegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Job Seeker registered successfully"}, status=status.HTTP_201_CREATED)

class CompanyRegisterView(generics.CreateAPIView):
    serializer_class = CompanyRegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Company registered successfully"}, status=status.HTTP_201_CREATED)




class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class MeView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user, context={"request": request})
        return Response(serializer.data)


class CompanyMeView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.user_type.lower() != 'company':
            return Response({"detail": "Unauthorized"}, status=403)
        serializer = MeSerializer(request.user, context={"request": request})
        return Response(serializer.data)




# class CompanyProfileView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]
#     parser_classes = [MultiPartParser, FormParser, JSONParser]
#     def get(self, request):
#         if request.user.user_type.lower() != "company":
#             return Response({"detail": "Unauthorized"}, status=403)

#         company, created = Company.objects.get_or_create(
#             user=request.user,
#             defaults={"company_name": request.user.company_name }
#         )
        
#                 # serializer = CompanyProfileSerializer(company)
#         serializer = CompanyProfileSerializer(
#                 company,
#                 context={"request": request}
#             )

#         return Response(serializer.data)

# backend/accounts/views.py
class CompanyProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        if request.user.user_type.lower() != "company":
            return Response({"detail": "Unauthorized"}, status=403)

        # Get or create the Company object for this user
        company, _ = Company.objects.get_or_create(
            user=request.user,
            defaults={"company_name": request.user.company_name or request.user.username}
        )

        # Serialize the Company object
        serializer = CompanyProfileSerializer(company, context={"request": request})

        return Response(serializer.data)

    def patch(self, request):
        if request.user.user_type.lower() != "company":
            return Response({"detail": "Unauthorized"}, status=403)

        company, created = Company.objects.get_or_create(
            user=request.user,
            defaults={"company_name": request.user.company_name or request.user.username}
        )
        serializer = CompanyProfileSerializer(
            company,
            data=request.data,
            partial=True,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)



from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated



class CompanyDocumentUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        if request.user.user_type.lower() != "company":
            return Response({"detail": "Unauthorized"}, status=403)

        company = Company.objects.get(user=request.user)
        docs = CompanyDocument.objects.filter(company=company)
        serializer = CompanyDocumentSerializer(docs, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.user_type.lower() != "company":
            return Response({"detail": "Unauthorized"}, status=403)

        company = Company.objects.get(user=request.user)
        document_key = request.data.get("document_key")
        file = request.data.get("file")

        if not document_key or not file:
            return Response(
                {"detail": "document_key and file are required"},
                status=400
            )

        obj, created = CompanyDocument.objects.update_or_create(
            company=company,
            document_key=document_key,
            defaults={"file": file}
        )

        serializer = CompanyDocumentSerializer(obj)
        return Response(serializer.data, status=200)





class JobSeekerProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        if request.user.user_type != "seeker":
            return Response({"detail": "Unauthorized"}, status=403)

        profile, _ = JobSeekerProfile.objects.get_or_create(
            user=request.user,
            
            # defaults={"full_name": request.user.username}
            defaults={
                "full_name": request.user.username,
                "mobile": "",
                "profession": "",
                "other_profession": "",
                "country": "",
                "state": "",
                "city": "",
                "area": "",
                "pincode": "",
                "location": "",
                "travel_willingness": "",
                "availability_status": "",
                "experience_level": "",
                "work_modes": [],
                "skills": [],
            }

        )
        serializer = JobSeekerProfileSerializer(
            profile,
            context={"request": request}
            )
        return Response(serializer.data)

    def patch(self, request):
        
        print("DATA:", request.data)
        print("FILES:", request.FILES)

        
        if request.user.user_type != "seeker":
            return Response({"detail": "Unauthorized"}, status=403)

        profile, _ = JobSeekerProfile.objects.get_or_create(
            user=request.user,
             defaults={
                "full_name": request.user.username,
                "mobile": "",
                "profession": "",
                "other_profession": "",
                "country": "",
                "state": "",
                "city": "",
                "area": "",
                "pincode": "",
                "location": "",
                "travel_willingness": "",
                "availability_status": "",
                "experience_level": "",
                "work_modes": [],
                "skills": [],
            }

        )

        serializer = JobSeekerProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={"request": request}
            )
        if not serializer.is_valid():
            print("SERIALIZER ERRORS:", serializer.errors)
            return Response(serializer.errors, status=400)
        serializer.save()
        return Response(serializer.data)



class JobSeekerDocumentView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        if request.user.user_type != "seeker":
            return Response({"detail": "Unauthorized"}, status=403)

        profile = JobSeekerProfile.objects.get(user=request.user)
        serializer = JobSeekerDocumentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        obj, _ = JobSeekerDocument.objects.update_or_create(
            profile=profile,
            document_type=request.data["document_type"],
            defaults={"file": request.data["file"]}
        )
        return Response(JobSeekerDocumentSerializer(obj).data)
    
from .wallet_utils import generate_new_wallet, encrypt_private_key, decrypt_private_key

class CreateManagedWalletView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.wallet_address and user.wallet_type == 'managed':
            return Response({"detail": "User already has a managed wallet"}, status=400)
        
        address, private_key = generate_new_wallet()
        encrypted_key = encrypt_private_key(private_key)
        
        user.wallet_address = address
        user.encrypted_private_key = encrypted_key
        user.wallet_type = 'managed'
        user.is_wallet_active = True
        user.save()
        
        return Response({
            "wallet_address": address,
            "wallet_type": "managed",
            "message": "Managed wallet created successfully"
        })

class UpdateWalletView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        wallet_address = request.data.get("wallet_address")
        wallet_type = request.data.get("wallet_type", "external")
        
        if wallet_address is None:
            return Response({"detail": "wallet_address is required"}, status=400)
            
        user = request.user
        user.wallet_address = wallet_address
        user.wallet_type = wallet_type
        user.is_wallet_active = bool(wallet_address)
        # If switching to external, clear the managed key
        if wallet_type == 'external':
            user.encrypted_private_key = None
            
        user.save()
        return Response({"message": "Wallet updated successfully"})
        
from web3 import Web3

class RelayTransactionView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.wallet_type != 'managed' or not user.encrypted_private_key:
            return Response({"detail": "Managed wallet not configured for this user"}, status=400)
            
        # Expecting { "to": "...", "data": "...", "value": "..." }
        tx_data = request.data.get("tx")
        if not tx_data:
            return Response({"detail": "Transaction data is required"}, status=400)
            
        try:
            # Connect to Polygon (using a public RPC for Amoy/Mainnet)
            # You might want to move this to settings
            rpc_url = "https://rpc-amoy.polygon.technology/" 
            w3 = Web3(Web3.HTTPProvider(rpc_url))
            
            # Decrypt private key
            private_key = decrypt_private_key(user.encrypted_private_key)
            account = w3.eth.account.from_key(private_key)
            
            # Prepare transaction
            to_addr = tx_data.get('to')
            gas_limit = int(tx_data.get('gas', 100000))
            gas_price = w3.eth.gas_price
            tx_value = int(tx_data.get('value', 0))
            
            # --- JIT Gas Funding ---
            max_cost = (gas_limit * gas_price) + tx_value
            current_balance = w3.eth.get_balance(account.address)
            
            if current_balance < max_cost:
                shortfall_wei = max_cost - current_balance
                shortfall_matic = float(w3.from_wei(shortfall_wei, 'ether'))
                print(f"[JIT Funding] User short by {shortfall_matic} MATIC. Pulling from Treasury...")
                from .blockchain_utils import fund_wallet_from_treasury
                fund_wallet_from_treasury(account.address, shortfall_matic)
                
            transaction = {
                'to': w3.to_checksum_address(to_addr) if to_addr else None,
                'value': tx_value,
                'gas': gas_limit,
                'gasPrice': gas_price,
                'nonce': w3.eth.get_transaction_count(account.address),
                'data': tx_data.get('data', '0x'),
                'chainId': w3.eth.chain_id
            }
            
            # Sign and broadcast
            try:
                signed_tx = w3.eth.account.sign_transaction(transaction, private_key)
                tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
                
                # Wait for receipt to ensure it was mined and get logs
                receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            except Exception as e:
                # If we hit extreme testnet spikes, mock it so the frontend doesn't crash during development
                import time
                if getattr(settings, 'DEBUG', False) and ("insufficient funds" in str(e).lower() or "exceeds" in str(e).lower() or "cap" in str(e).lower()):
                    print(f"[Relay DEV Bypass] Relayer caught gas/funds error: {str(e)}. Simulating success for Frontend.")
                    tx_hash = w3.to_bytes(text=f"mock_tx_{time.time()}")
                    receipt = {
                        "status": 1,
                        "blockNumber": 999999,
                        "logs": [{
                            "address": "0xMockAddress",
                            "topics": [
                                Web3.keccak(text="AgreementCreated(uint256,address,address,uint256)").hex(),
                                "0x0000000000000000000000000000000000000000000000000000000000000063" # Simulated ID 99
                            ],
                            "data": "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                            "blockNumber": 999999,
                            "transactionHash": tx_hash.hex(),
                            "logIndex": 0
                        }]
                    }
                else:
                    raise e

            # Prepare serialized logs for ethers.js
            serialized_logs = []
            
            def safe_hex(val):
                res = val
                if isinstance(val, str):
                    res = val
                elif hasattr(val, 'hex'):
                    res = val.hex()
                
                if isinstance(res, str) and not res.startswith('0x'):
                    return '0x' + res
                return res
                
            for log in receipt.get('logs', []):
                serialized_log = {
                    'address': log.get('address'),
                    'topics': [safe_hex(t) for t in log.get('topics', [])],
                    'data': safe_hex(log.get('data')),
                    'blockNumber': log.get('blockNumber'),
                    'transactionHash': safe_hex(log.get('transactionHash')),
                    'logIndex': log.get('logIndex')
                }
                serialized_logs.append(serialized_log)

            return Response({
                "success": True,
                "tx_hash": safe_hex(tx_hash),
                "receipt": {
                    "status": receipt.get('status'),
                    "blockNumber": receipt.get('blockNumber'),
                    "logs": serialized_logs
                },
                "message": "Transaction relayed and confirmed"
            })
            
        except Exception as e:
            print(f"Relay Error: {str(e)}")
            return Response({"detail": f"Relay failed: {str(e)}"}, status=500)

class CreateRazorpayOrderView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        amount = request.data.get("amount") # In INR (float/int)
        if not amount:
            return Response({"detail": "Amount is required"}, status=400)
        
        try:
            order = create_order(amount)
            return Response(order)
        except Exception as e:
            return Response({"detail": str(e)}, status=500)

class VerifyRazorpayPaymentView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        payment_id = request.data.get("payment_id")
        signature = request.data.get("signature")
        agreement_id = request.data.get("agreement_id")
        on_chain_id = request.data.get("on_chain_id")
        amount_inr = request.data.get("amount_inr")
        is_mock = request.data.get("is_mock", False)

        try:
            if not all([order_id, payment_id, signature, agreement_id, amount_inr]):
                return Response({"detail": "Missing payment verification data"}, status=400)

            # 1. Verify Razorpay Signature
            from accounts.razorpay_utils import verify_payment
            
            if not getattr(settings, 'DEBUG', False):
                if not verify_payment(order_id, payment_id, signature):
                    return Response({"detail": "Invalid payment signature"}, status=400)

            # 2. Update WorkAgreement status to in_progress
            agreement = WorkAgreement.objects.get(id=agreement_id)

            # --- PRODUCTION MODE: Fund Escrow on Polygon ---
            user = request.user
            if user.wallet_type != 'managed' or not user.encrypted_private_key:
                return Response({"detail": "Managed wallet not configured. Cannot process real transaction."}, status=400)

            # 2a. Convert Fiat to Crypto
            print(f"[Conversion] Calculating crypto needed for {amount_inr} INR")
            from .blockchain_utils import get_live_matic_price_inr, fund_wallet_from_treasury, fund_agreement_on_chain

            matic_price_inr = get_live_matic_price_inr()
            fiat_value = float(amount_inr) / 100.0  # Razorpay is in paise
            matic_amount = fiat_value / matic_price_inr
            matic_amount = round(matic_amount, 3)

            from .wallet_utils import decrypt_private_key
            private_key = decrypt_private_key(user.encrypted_private_key)
            from eth_account import Account
            user_address = Account.from_key(private_key).address

            # ─── DEV BYPASS: Skip real blockchain in DEBUG mode ───────────────────
            if settings.DEBUG:
                print(f"[DEV BYPASS] Simulating blockchain escrow for {matic_amount} MATIC. No real tx sent.")
                treasury_tx = "0x_dev_treasury_mock"
                tx_hash = "0x_dev_escrow_mock"

                if not agreement.on_chain_id:
                    import random
                    agreement.on_chain_id = random.randint(1000, 9999)
                    agreement.save()

            # ─── PRODUCTION: Real blockchain transactions ──────────────────────────
            else:
                from web3 import Web3
                from .blockchain_utils import RPC_URL, create_agreement_on_chain
                w3 = Web3(Web3.HTTPProvider(RPC_URL))
                user_balance = w3.eth.get_balance(user_address)
                required_balance = w3.to_wei(matic_amount + 0.005, 'ether')

                treasury_tx = "0x_skipped_already_funded"
                if user_balance < required_balance:
                    print(f"[Blockchain] Funding user wallet ({user_address}) from Treasury...")
                    treasury_tx, _ = fund_wallet_from_treasury(user_address, matic_amount)

                if not agreement.on_chain_id:
                    print(f"[Blockchain] Creating Escrow on-chain...")
                    created_id, create_tx_hash, _ = create_agreement_on_chain(user_address, matic_amount, private_key)
                    agreement.on_chain_id = created_id
                    agreement.save()

                print(f"[Blockchain] Funding Escrow with ID: {agreement.on_chain_id}...")
                tx_hash, receipt = fund_agreement_on_chain(agreement.on_chain_id, matic_amount, private_key)

            from .models import WalletTransaction
            WalletTransaction.objects.create(
                user=user, transaction_type='deposit', amount=matic_amount, tx_hash=treasury_tx, description="Fiat Deposit Conversion"
            )
            WalletTransaction.objects.create(
                user=user, transaction_type='escrow_lock', amount=matic_amount, tx_hash=tx_hash, description=f"Escrow Locked: {agreement.job_title}"
            )

            agreement.status = "in_progress"
            agreement.tx_hash = tx_hash
            agreement.save()

            return Response({
                "success": True,
                "message": f"Fiat payment of {amount_inr} INR verified. Escrow funded with {matic_amount} MATIC.",
                "tx_hash": tx_hash
            })

        except WorkAgreement.DoesNotExist:
            return Response({"detail": "Agreement not found"}, status=404)
        except Exception as e:
            print(f"Payment processing error: {str(e)}")
            return Response({"detail": f"Payment processing failed: {str(e)}"}, status=500)


from .models import WalletTransaction
from django.db.models import Sum

class WalletDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        available_balance = 0.0
        
        # 1. Fetch live MATIC balance from Polygon RPC
        if user.wallet_type == 'managed' and user.wallet_address:
            try:
                from .blockchain_utils import RPC_URL
                from web3 import Web3
                w3 = Web3(Web3.HTTPProvider(RPC_URL))
                balance_wei = w3.eth.get_balance(user.wallet_address)
                available_balance = round(float(w3.from_wei(balance_wei, 'ether')), 4)
            except Exception as e:
                print(f"Error fetching live balance: {e}")

        # 2. Calculate Locked Escrow cleanly: Sum of lock MINUS Sum of release
        locked_in = float(WalletTransaction.objects.filter(
            user=user, 
            transaction_type='escrow_lock'
        ).aggregate(Sum('amount'))['amount__sum'] or 0.0)
        
        locked_out = float(WalletTransaction.objects.filter(
            user=user, 
            transaction_type='escrow_release'
        ).aggregate(Sum('amount'))['amount__sum'] or 0.0)
        
        locked_escrow = locked_in - locked_out
        # 3. Calculate Total Earned (for Seekers)
        total_earned = WalletTransaction.objects.filter(
            user=user,
            transaction_type='income'
        ).aggregate(Sum('amount'))['amount__sum'] or 0.0

        # 4. Transaction History
        tx_qs = WalletTransaction.objects.filter(user=user).order_by('-timestamp')[:50]
        history = []
        for tx in tx_qs:
            history.append({
                "id": tx.id,
                "type": tx.transaction_type,
                "amount": float(tx.amount),
                "currency": tx.currency,
                "tx_hash": tx.tx_hash,
                "status": tx.status,
                "description": tx.description,
                "timestamp": tx.timestamp.isoformat()
            })

        return Response({
            "available_balance": available_balance,
            "locked_escrow": float(locked_escrow),
            "total_earned": float(total_earned),
            "history": history,
            "wallet_address": user.wallet_address
        })

class WithdrawMaticView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        target_address = request.data.get('target_address')
        amount = request.data.get('amount')
        
        if not target_address or not amount:
            return Response({"error": "Target address and amount are required."}, status=400)
            
        try:
            matic_amount = float(amount)
            if matic_amount <= 0:
                return Response({"error": "Amount must be greater than zero."}, status=400)
        except ValueError:
            return Response({"error": "Invalid amount format."}, status=400)

        if user.wallet_type != 'managed' or not user.encrypted_private_key:
            return Response({"error": "Managed wallet not configured."}, status=400)

        from .wallet_utils import decrypt_private_key
        private_key = decrypt_private_key(user.encrypted_private_key)

        from .blockchain_utils import withdraw_matic
        try:
            tx_hash, receipt = withdraw_matic(private_key, target_address, matic_amount)
            
            # Log the withdrawal
            WalletTransaction.objects.create(
                user=user,
                transaction_type='withdrawal',
                amount=matic_amount,
                tx_hash=tx_hash,
                description=f"Withdrawal to {target_address}"
            )
            
            return Response({
                "success": True, 
                "message": f"Successfully withdrawn {matic_amount} MATIC.",
                "tx_hash": tx_hash
            })
        except ValueError as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            print(f"Withdrawal error: {str(e)}")
            return Response({"error": f"Withdrawal failed: {str(e)}"}, status=500)

from rest_framework.permissions import IsAdminUser

class AdminCompanyListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        companies = Company.objects.all()
        serializer = CompanyProfileSerializer(companies, many=True, context={'request': request})
        return Response(serializer.data)

class AdminCompanyDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            company = Company.objects.get(pk=pk)
            serializer = CompanyProfileSerializer(company, context={'request': request})
            
            # Include documents
            docs = company.documents.all()
            doc_serializer = CompanyDocumentSerializer(docs, many=True, context={'request': request})
            
            data = serializer.data
            data['documents'] = doc_serializer.data
            return Response(data)
        except Company.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

class AdminVerifyCompanyView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            company = Company.objects.get(pk=pk)
            status_val = request.data.get('status')
            reason = request.data.get('rejection_reason', "")

            if status_val not in ['verified', 'rejected']:
                return Response({"detail": "Invalid status"}, status=400)

            company.verification_status = status_val
            company.rejection_reason = reason
            company.save()

            return Response({"message": f"Company {status_val} successfully"})
        except Company.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

class AdminUserListView(generics.ListAPIView):
    queryset = CustomUser.objects.filter(user_type='seeker').order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminUserStatusView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
            if user.is_superuser:
                return Response({"detail": "Cannot modify superuser status"}, status=400)
            
            user.is_active = not user.is_active
            user.save()
            return Response({"message": f"User {'blocked' if not user.is_active else 'unblocked'} successfully", "is_active": user.is_active})
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found"}, status=404)

class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        seeker_count = JobSeekerProfile.objects.count()
        company_count = Company.objects.count()
        job_count = Job.objects.filter(is_deleted=False).count()
        pending_verifications = Company.objects.filter(verification_status='pending').count()

        # Simple "trend" calculation or just return counts
        # trend logic can be added later if needed
        
        return Response({
            "seekers": seeker_count,
            "companies": company_count,
            "jobs": job_count,
            "pending": pending_verifications
        })

class CompanyStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'company':
            return Response({"detail": "Only companies can access these stats."}, status=403)
        
        company_jobs = Job.objects.filter(company=request.user, is_deleted=False)
        active_jobs_count = company_jobs.filter(status='Active').count()
        
        # All applications to this company's jobs
        applications = JobApplication.objects.filter(company_job__in=company_jobs)
        total_apps = applications.count()
        
        interviews = applications.filter(status='Interview').count()
        shortlisted = applications.filter(status='Shortlisted').count()
        
        return Response({
            "active_jobs": active_jobs_count,
            "total_applications": total_apps,
            "interviews": interviews,
            "shortlisted": shortlisted
        })
