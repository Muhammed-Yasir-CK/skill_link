from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import JobApplication,SavedJob
from .serializers import JobApplicationSerializer,SavedJobSerializer
from work.models import WorkPost
from jobs.models import Job
from django.db import IntegrityError

from .models import ApplicationActivity       
from rest_framework.views import APIView
from .serializers import WorkerApplicationSerializer,CompanyApplicationSerializer

from django.shortcuts import get_object_or_404



class JobApplicationViewSet(ModelViewSet):

    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(applicant=self.request.user)

    def create(self, request, *args, **kwargs):

        job_id = request.data.get("job_id")
        job_source = request.data.get("job_source")

        if job_source == "user":
            try:
                job = WorkPost.objects.get(id=job_id)

                # CHECK DUPLICATE
                if JobApplication.objects.filter(
                    applicant=request.user,
                    user_job=job
                ).exists():
                    return Response(
                        {"error": "Already applied"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                application = JobApplication.objects.create(
                    applicant=request.user,
                    job_source="user",
                    user_job=job
                )

            except WorkPost.DoesNotExist:
                return Response(
                    {"error": "User job not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        elif job_source == "company":
            try:
                job = Job.objects.get(id=job_id)

                #  CHECK DUPLICATE
                if JobApplication.objects.filter(
                    applicant=request.user,
                    company_job=job
                ).exists():
                    return Response(
                        {"error": "Already applied"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                application = JobApplication.objects.create(
                    applicant=request.user,
                    job_source="company",
                    company_job=job,
                )

            except Job.DoesNotExist:
                return Response(
                    {"error": "Company job not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        else:
            return Response(
                {"error": "Invalid job source"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    
    

class SavedJobViewSet(ModelViewSet):
    queryset = SavedJob.objects.all() 
    serializer_class = SavedJobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user)

    def create(self, request):
        job_id = request.data.get("job_id")
        job_source = request.data.get("job_source")

        if job_source == "user":
            job = get_object_or_404(WorkPost, id=job_id)

            saved_job = SavedJob.objects.filter(
                user=request.user,
                user_job=job
            ).first()

            if saved_job:
                saved_job.delete()
                return Response({"saved": False}, status=200)

            saved_job = SavedJob.objects.create(
                user=request.user,
                user_job=job,
                job_source="user"
            )

        elif job_source == "company":
            job = get_object_or_404(Job, id=job_id)

            saved_job = SavedJob.objects.filter(
                user=request.user,
                company_job=job
            ).first()

            if saved_job:
                saved_job.delete()
                return Response({"saved": False}, status=200)

            saved_job = SavedJob.objects.create(
                user=request.user,
                company_job=job,
                job_source="company"
            )

        else:
            return Response({"error": "Invalid source"}, status=400)

        #  RETURN SERIALIZED OBJECT WITH CONTEXT
        serializer = SavedJobSerializer(
            saved_job,
            context={"request": request}
        )
        return Response(serializer.data, status=201)
    
    
    
    
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from .models import JobApplication
from .serializers import ApplicationSerializer

class MyApplicationsView(ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(
            applicant=self.request.user
        ).order_by("-applied_at")
        
        
class WorkerReceivedApplicationsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        applications = JobApplication.objects.filter(
            user_job__user=request.user
        ).select_related(
            "applicant",
            "user_job",
            "applicant__seeker_profile"
        ).prefetch_related(
            "applicant__seeker_profile__documents"
        )

        serializer = WorkerApplicationSerializer(
            applications,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)
    
    
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import JobApplication




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import JobApplication, ApplicationActivity

class UpdateApplicationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    # Status flow for company jobs
    COMPANY_STATUS_FLOW = ["Pending", "Review", "Shortlist", "Interview", "Selected"]
    # Status rules for user jobs (work provider)
    USER_JOB_FINAL_STATUS = ["Selected", "Rejected"]

    def patch(self, request, pk):
        try:
            application = JobApplication.objects.get(id=pk)
        except JobApplication.DoesNotExist:
            return Response({"error": "Application not found"}, status=404)

        new_status = request.data.get("status")
        current_status = application.status

        # Determine if this is a company job or user job
        is_company_job = application.company_job is not None
        is_user_job = application.user_job is not None

        # Permission checks
        if is_company_job and application.company_job.company != request.user:
            return Response({"error": "Permission denied"}, status=403)
        if is_user_job and application.user_job.user != request.user:
            return Response({"error": "Permission denied"}, status=403)

        # ---------- USER JOB RULES ----------
        if is_user_job:
            # Reject allowed anytime
            if new_status == "Rejected":
                application.status = "Rejected"
                application.save()
                return Response({"message": "Application rejected", "status": "Rejected"})

            # Only Pending → Selected allowed
            if current_status == "Pending" and new_status == "Selected":
                application.status = "Selected"
                application.save()
                return Response({"message": "Candidate selected", "status": "Selected"})

            # Final statuses cannot be changed
            if current_status in self.USER_JOB_FINAL_STATUS:
                return Response({"error": "Final status cannot be changed"}, status=400)

            return Response({"error": "Invalid status change for user job"}, status=400)

        # ---------- COMPANY JOB RULES ----------
        if is_company_job:
            FINAL_STATUS = ["Selected", "Rejected"]

            # Reject allowed anytime
            if new_status == "Rejected":
                application.status = "Rejected"
                application.save()
                return Response({"message": "Application rejected", "status": "Rejected"})

            # Validate status in flow
            if new_status not in self.COMPANY_STATUS_FLOW:
                return Response({"error": "Invalid status"}, status=400)

            # Cannot change if already final
            if current_status in FINAL_STATUS:
                return Response({"error": "Final status cannot be changed"}, status=400)

            current_index = self.COMPANY_STATUS_FLOW.index(current_status)
            new_index = self.COMPANY_STATUS_FLOW.index(new_status)

            # Prevent skipping steps
            if new_index != current_index + 1:
                return Response({"error": "Status must follow order"}, status=400)

            old_status = application.status
            application.status = new_status
            application.save()

            # Log activity
            ApplicationActivity.objects.create(
                application=application,
                old_status=old_status,
                new_status=new_status,
                actor=request.user
            )

            return Response({"message": "Status updated", "status": application.status})

        return Response({"error": "Invalid job type"}, status=400)
        
        
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import JobApplication
from .serializers import WorkerApplicationSerializer


class CompanyReceivedApplicationsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        applications = JobApplication.objects.filter(
            company_job__company=request.user
        ).select_related(
            "applicant",
            "company_job",
            "applicant__seeker_profile"
        ).prefetch_related(
            "applicant__seeker_profile__documents",
            "activities"
        )

        serializer = CompanyApplicationSerializer(
            applications,
            many=True,
            context={"request": request}
)

        return Response(serializer.data)
    
    
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from applications.models import JobApplication, WorkAgreement
from accounts.models import JobSeekerProfile, Company


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import JobApplication, WorkAgreement


class CreateAgreementView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, application_id):

        try:
            application = JobApplication.objects.get(id=application_id)
        except JobApplication.DoesNotExist:
            return Response({"error": "Application not found"}, status=404)

        # check existing agreement
        agreement = WorkAgreement.objects.filter(application=application).first()

        if agreement:
            return Response({
                "message": "Agreement already exists",
                "agreement_id": agreement.id
            })

        job_title = application.get_job_title() or "Untitled Job"

        try:
            agreement = WorkAgreement.objects.create(
                application=application,
                provider=request.user,
                seeker=application.applicant,
                job_title=job_title,

                description=request.data.get("description", ""),
                deliverables=request.data.get("deliverables", []),
                deadline=request.data.get("deadline") or None,

                amount=request.data.get("amount") or 0.0,
                currency=request.data.get("currency", "INR"),
                payment_method=request.data.get("method", "Blockchain Escrow"),
                release_strategy=request.data.get("release_strategy", ""),

                terms=request.data.get("terms", []),
                on_chain_id=request.data.get("on_chain_id")
            )

            return Response({
                "message": "Agreement created successfully",
                "agreement_id": agreement.id
            }, status=201)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": f"Failed to create agreement: {str(e)}", "trace": traceback.format_exc()}, status=500)
        
        
class GetAgreementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, application_id):

        application = JobApplication.objects.filter(id=application_id).first()
        if not application:
            return Response({"exists": False})

        job_title = application.get_job_title() or ""
        description = ""
        employer_name = ""
        
        seeker_profile = getattr(application.applicant, "seeker_profile", None)
        if seeker_profile and getattr(seeker_profile, "full_name", ""):
            seeker_name = seeker_profile.full_name
        else:
            seeker_name = f"{application.applicant.first_name} {application.applicant.last_name}".strip() or application.applicant.username

        if application.job_source == "user" and application.user_job:
            description = getattr(application.user_job, 'description', getattr(application.user_job, 'details', ''))
            user = application.user_job.user
            if getattr(user, 'user_type', None) == 'company' and hasattr(user, 'company_profile') and user.company_profile.company_name:
                employer_name = user.company_profile.company_name
            elif getattr(user, 'user_type', None) == 'seeker' and hasattr(user, 'seeker_profile') and user.seeker_profile.full_name:
                employer_name = user.seeker_profile.full_name
            else:
                employer_name = f"{user.first_name} {user.last_name}".strip() or user.username
        elif application.job_source == "company" and application.company_job:
            description = getattr(application.company_job, 'description', getattr(application.company_job, 'details', ''))
            if application.company_job.company:
                employer_name = application.company_job.company.company_name
            else:
                employer_name = "Company"

        default_data = {
            "job_title": job_title,
            "description": description,
            "employer_name": employer_name,
            "seeker_name": seeker_name,
            "seeker_wallet": application.applicant.wallet_address,
            "seeker_has_wallet": application.applicant.is_wallet_active,
            "provider_email": application.user_job.user.email if (application.job_source == "user" and application.user_job) else (application.company_job.company.official_email if (application.job_source == "company" and application.company_job and hasattr(application.company_job.company, 'official_email')) else ""),
        }

        agreement = WorkAgreement.objects.filter(application_id=application_id).first()

        if not agreement:
            return Response({
                "exists": False,
                "default_data": default_data
            })

        return Response({
            "exists": True,
            "default_data": default_data,
            "agreement": {
                "id": agreement.id,
                "description": agreement.description,
                "deliverables": agreement.deliverables,
                "deadline": agreement.deadline,
                "amount": agreement.amount,
                "currency": agreement.currency,
                "method": agreement.payment_method,
                "release_strategy": agreement.release_strategy,
                "terms": agreement.terms,
                "status": agreement.status,
                "tx_hash": agreement.tx_hash,
                "on_chain_id": agreement.on_chain_id,
                "submission_notes": agreement.submission_notes,
                "submission_attachment": agreement.submission_attachment.url if agreement.submission_attachment else None
            }
        })
        
        
        
class UpdateAgreementView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, agreement_id):

        try:
            agreement = WorkAgreement.objects.get(id=agreement_id)
        except WorkAgreement.DoesNotExist:
            return Response({"error": "Agreement not found"}, status=404)

        if agreement.provider != request.user:
            return Response({"error": "Not allowed"}, status=403)

        agreement.description = request.data.get("description", agreement.description)
        agreement.deliverables = request.data.get("deliverables", agreement.deliverables)
        
        new_deadline = request.data.get("deadline")
        agreement.deadline = new_deadline if new_deadline else agreement.deadline

        new_amount = request.data.get("amount")
        agreement.amount = new_amount if new_amount else agreement.amount
        
        agreement.currency = request.data.get("currency", agreement.currency)
        agreement.payment_method = request.data.get("method", agreement.payment_method)
        agreement.release_strategy = request.data.get("release_strategy", agreement.release_strategy)

        agreement.terms = request.data.get("terms", agreement.terms)

        try:
            agreement.save()
            return Response({"message": "Agreement updated"})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": f"Failed to update agreement: {str(e)}"}, status=500)


class SeekerGetAgreementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, application_id):
        try:
            agreement = WorkAgreement.objects.get(application_id=application_id)
        except WorkAgreement.DoesNotExist:
            return Response({"error": "Agreement not found"}, status=404)

        if agreement.seeker != request.user:
            return Response({"error": "Not allowed"}, status=403)
            
        application = agreement.application
        provider_name = ""
        
        if application.job_source == "user" and application.user_job:
            user = application.user_job.user
            if getattr(user, 'user_type', None) == 'company' and hasattr(user, 'company_profile') and user.company_profile.company_name:
                provider_name = user.company_profile.company_name
            elif getattr(user, 'user_type', None) == 'seeker' and hasattr(user, 'seeker_profile') and user.seeker_profile.full_name:
                provider_name = user.seeker_profile.full_name
            else:
                provider_name = f"{user.first_name} {user.last_name}".strip() or user.username
        elif application.job_source == "company" and application.company_job:
            if application.company_job.company:
                provider_name = application.company_job.company.company_name
            else:
                provider_name = "Company"
        else:
            provider_name = f"{agreement.provider.first_name} {agreement.provider.last_name}".strip() or agreement.provider.username
            
        return Response({
            "agreement": {
                "id": agreement.id,
                "job_title": agreement.job_title,
                "provider_name": provider_name,
                "description": agreement.description,
                "deliverables": agreement.deliverables,
                "deadline": agreement.deadline,
                "amount": agreement.amount,
                "currency": agreement.currency,
                "method": agreement.payment_method,
                "release_strategy": agreement.release_strategy,
                "terms": agreement.terms,
                "status": agreement.status,
                "tx_hash": agreement.tx_hash,
                "on_chain_id": agreement.on_chain_id,
                "submission_notes": agreement.submission_notes,
                "submission_attachment": agreement.submission_attachment.url if agreement.submission_attachment else None
            }
        })


class SeekerRespondAgreementView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, application_id):
        try:
            agreement = WorkAgreement.objects.get(application_id=application_id)
        except WorkAgreement.DoesNotExist:
            return Response({"error": "Agreement not found"}, status=404)

        if agreement.seeker != request.user:
            return Response({"error": "Not allowed"}, status=403)

        action = request.data.get("action")
        
        if agreement.status != "pending":
            return Response({"error": f"Cannot respond to agreement in {agreement.status} status"}, status=400)

        if action == "accept":
            agreement.status = "accepted"
            agreement.save()
            return Response({"message": "Agreement accepted", "status": agreement.status})
        elif action == "reject":
            agreement.status = "rejected"
            agreement.save()
            return Response({"message": "Agreement rejected", "status": agreement.status})
        elif action == "complete":
            # Releasing the funds to the seeker
            agreement.status = "completed"
            agreement.save()
            
            # Log the income for the Seeker
            from accounts.models import WalletTransaction
            from accounts.blockchain_utils import get_live_matic_price_inr
            from django.conf import settings
            
            try:
                matic_price_inr = get_live_matic_price_inr()
                fiat_value = float(agreement.amount)
                matic_amount = round(fiat_value / matic_price_inr, 3) if not getattr(settings, 'DEBUG', False) else 0.005
                
                WalletTransaction.objects.create(
                    user=request.user,
                    transaction_type='income',
                    amount=matic_amount,
                    tx_hash=agreement.tx_hash,
                    description=f"Payment Released for {agreement.job_title}"
                )
            except Exception as e:
                print(f"Error logging income transaction: {e}")
                
            return Response({"message": "Agreement marked as completed", "status": agreement.status})
        else:
            return Response({"error": "Invalid action"}, status=400)


class ProviderPayAgreementView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, agreement_id):
        try:
            agreement = WorkAgreement.objects.get(id=agreement_id)
        except WorkAgreement.DoesNotExist:
            return Response({"error": "Agreement not found"}, status=404)

        if agreement.provider != request.user:
            return Response({"error": "Not allowed"}, status=403)

        if agreement.status != "accepted":
            return Response({"error": f"Cannot pay for agreement in {agreement.status} status"}, status=400)

        tx_hash = request.data.get("tx_hash")
        if not tx_hash:
            return Response({"error": "Transaction hash is required"}, status=400)

        agreement.tx_hash = tx_hash
        agreement.status = "in_progress"
        agreement.save()

        return Response({"message": "Payment successful, work is now in progress", "status": agreement.status, "tx_hash": tx_hash})


class SeekerSubmitWorkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, application_id):
        try:
            agreement = WorkAgreement.objects.get(application_id=application_id)
        except WorkAgreement.DoesNotExist:
            return Response({"error": "Agreement not found"}, status=404)

        if agreement.seeker != request.user:
            return Response({"error": "Not allowed"}, status=403)

        if agreement.status != "in_progress":
            return Response({"error": f"Cannot submit work in {agreement.status} status"}, status=400)

        submission_notes = request.data.get("submission_notes")
        submission_attachment = request.FILES.get("submission_attachment")

        if submission_notes is not None:
            agreement.submission_notes = submission_notes
        if submission_attachment is not None:
            agreement.submission_attachment = submission_attachment

        agreement.status = "submitted"
        agreement.save()

        return Response({"message": "Work submitted successfully", "status": agreement.status})


class ProviderApproveWorkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, agreement_id):
        try:
            agreement = WorkAgreement.objects.get(id=agreement_id)
        except WorkAgreement.DoesNotExist:
            return Response({"error": "Agreement not found"}, status=404)

        application = agreement.application
        is_allowed = False

        if application.job_source == "user" and application.user_job:
            if application.user_job.user == request.user:
                is_allowed = True
        elif application.job_source == "company" and application.company_job:
            user = request.user
            if getattr(user, 'user_type', None) == 'company' and application.company_job.company == user:
                is_allowed = True

        if agreement.provider == request.user:
            is_allowed = True

        if not is_allowed:
            return Response({"error": "Not allowed"}, status=403)

        if agreement.status != "submitted":
            return Response({"error": f"Cannot approve work in '{agreement.status}' status, expecting 'submitted'"}, status=400)

        # TRIGGER BLOCKCHAIN RELEASE
        from django.conf import settings

        if settings.DEBUG:
            # ─── DEV BYPASS: Skip real blockchain in DEBUG mode ───────────────────
            print("[DEV BYPASS] Simulating blockchain escrow release. No real tx sent.")
            if not agreement.on_chain_id:
                import random
                agreement.on_chain_id = random.randint(1000, 9999)
                agreement.save()
        else:
            # ─── PRODUCTION: Real blockchain transactions ──────────────────────────
            if not agreement.on_chain_id:
                return Response({"error": "Agreement is not linked to a blockchain smart contract ID. Cannot release funds."}, status=400)

            if request.user.wallet_type != 'managed' or not request.user.encrypted_private_key:
                return Response({"error": "You must have a managed Web3 Wallet to release these funds."}, status=400)

            from accounts.wallet_utils import decrypt_private_key
            from accounts.blockchain_utils import fund_wallet_from_treasury, complete_agreement_on_chain

            try:
                private_key = decrypt_private_key(request.user.encrypted_private_key)
                from eth_account import Account
                user_address = Account.from_key(private_key).address

                # Ensure the user has Gas to mark it completed
                print(f"[Blockchain] Funding user {request.user.username} with Gas for release...")
                fund_wallet_from_treasury(user_address, 0)  # Just Gas buffer

                release_tx, _ = complete_agreement_on_chain(agreement.on_chain_id, private_key)
                print(f"[Blockchain] Escrow released with TX: {release_tx}")
            except Exception as e:
                return Response({"error": f"Failed to release on-chain escrow: {str(e)}"}, status=500)

        agreement.status = "completed"
        agreement.save()
        
        from accounts.models import WalletTransaction
        
        # We must find the EXACT MATIC amount that was originally locked for this specific transaction hash.
        # The agreement.amount is in fiat (INR), so it cannot be used directly.
        original_lock = WalletTransaction.objects.filter(
            user=agreement.provider,
            transaction_type='escrow_lock',
            tx_hash=agreement.tx_hash
        ).first()

        matic_amount = original_lock.amount if original_lock else 0.0

        # Log the release so the Provider's 'Locked in Escrow' UI updates correctly
        WalletTransaction.objects.create(
            user=agreement.provider,
            transaction_type='escrow_release',
            amount=matic_amount,
            tx_hash=agreement.tx_hash,
            description=f"Escrow Released: {agreement.job_title}"
        )
        
        # Log the income for the Seeker's 'Total Earned' and 'Available Balance' functionality
        WalletTransaction.objects.create(
            user=agreement.seeker,
            transaction_type='income',
            amount=matic_amount,
            tx_hash=agreement.tx_hash,
            description=f"Payment Received: {agreement.job_title}"
        )

        return Response({"message": "Work approved and marked complete", "status": agreement.status})

class UserCompletedWorksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Q
        user = request.user
        
        # Fetch completed agreements where the user is either the seeker or provider
        agreements = WorkAgreement.objects.filter(
            Q(seeker=user) | Q(provider=user), 
            status='completed'
        ).order_by('-created_at')
        
        completed_works = []
        for ag in agreements:
            
            location = "Remote"
            work_type = "Contract"
            tags = []
            
            # Determine the role of the user in this agreement
            role_in_agreement = 'seeker' if ag.seeker == user else 'provider'
            
            if role_in_agreement == 'seeker':
                provider_full_name = f"{ag.provider.first_name} {ag.provider.last_name}".strip() or ag.provider.username
                role_display = "Worked for: " + provider_full_name
            else:
                seeker_profile = getattr(ag.seeker, "seeker_profile", None)
                if seeker_profile and getattr(seeker_profile, "full_name", ""):
                    seeker_full_name = seeker_profile.full_name
                else:
                    seeker_full_name = f"{ag.seeker.first_name} {ag.seeker.last_name}".strip() or ag.seeker.username
                role_display = "Worker: " + seeker_full_name
                
            app = ag.application
            if app.job_source == 'user' and app.user_job:
                location = app.user_job.city or "Flexible"
                work_type = app.user_job.work_nature
                tags = app.user_job.skills or []
                if role_in_agreement == 'seeker':
                    other_party_name = f"{app.user_job.user.first_name} {app.user_job.user.last_name}".strip() or app.user_job.user.username
                    role_display = "Employer: " + other_party_name
            elif app.job_source == 'company' and app.company_job:
                location = app.company_job.location or "Remote"
                work_type = app.company_job.employment_type
                tags = app.company_job.skills or []
                if role_in_agreement == 'seeker' and app.company_job.company:
                    other_party_name = app.company_job.company.company_name
                    role_display = "Company: " + other_party_name

            completed_works.append({
                "id": ag.id,
                "application_id": app.id,
                "title": ag.job_title or "Completed Work",
                "company": role_display,
                "location": location,
                "workType": work_type,
                "salary": f"{ag.amount} {ag.currency}",
                "posted": ag.created_at.strftime("%b %d, %Y") if hasattr(ag, 'created_at') else "Recently",
                "tags": tags,
                "source": app.job_source,
                "user_role": role_in_agreement
            })
            
        return Response({"completed_works": completed_works})