/**
 * Integration test script for Join Forms & Membership Requests feature.
 * 
 * Connects directly to MongoDB to seed a society + president role,
 * then tests all 11 join-related API endpoints.
 * 
 * Usage:
 *   1. Start the server:  npx ts-node app/server.ts
 *   2. Run this script:   npx ts-node scripts/testJoinForms.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Society from '../app/src/models/Society';
import SocietyUserRole from '../app/src/models/SocietyUserRole';
import Group from '../app/src/models/Group';
import GroupMember from '../app/src/models/GroupMember';

const BASE = 'http://localhost:5000/api';
const TS = Date.now();

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function api(method: string, path: string, body?: any, token?: string) {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    const data = await res.json();
    return { status: res.status, data };
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`  [FAIL]: ${message}`);
        failed++;
        return false;
    }
    console.log(`  [PASS]: ${message}`);
    passed++;
    return true;
}

// ─── Main Test Flow ──────────────────────────────────────────────────────────

async function main() {
    console.log('\nJoin Forms Feature — Integration Tests\n');
    console.log('='.repeat(60));

    // ── Connect to DB for seeding ────────────────────────────────────
    console.log('\nConnecting to MongoDB for test seeding...');
    await mongoose.connect(process.env.DB_URL as string);
    console.log('  Connected to MongoDB\n');

    // ── Step 1: Signup two users ─────────────────────────────────────
    console.log('Step 1: Creating test users...');

    const presidentSignup = await api('POST', '/auth/signup', {
        name: 'Test President',
        email: `president_${TS}@test.com`,
        password: 'Test@1234',
        phone: '1234567890'
    });
    assert(presidentSignup.status === 201, 'President signup');
    const presidentId = presidentSignup.data.data._id;

    const userSignup = await api('POST', '/auth/signup', {
        name: 'Test Applicant',
        email: `applicant_${TS}@test.com`,
        password: 'Test@1234',
        phone: '9876543210'
    });
    assert(userSignup.status === 201, 'Applicant signup');
    const applicantId = userSignup.data.data._id;

    // ── Step 2: Login both users ─────────────────────────────────────
    console.log('\nStep 2: Logging in...');

    const presidentLogin = await api('POST', '/auth/login', {
        email: `president_${TS}@test.com`,
        password: 'Test@1234'
    });
    assert(presidentLogin.status === 200, 'President login');
    const presidentToken = presidentLogin.data.data.accessToken;

    const userLogin = await api('POST', '/auth/login', {
        email: `applicant_${TS}@test.com`,
        password: 'Test@1234'
    });
    assert(userLogin.status === 200, 'Applicant login');
    const userToken = userLogin.data.data.accessToken;

    // ── Step 3: Seed society + president role directly in DB ──────────
    console.log('\nStep 3: Seeding society + president role via DB...');

    const society = await Society.create({
        name: `Test Society ${TS}`,
        description: 'A test society for join form testing',
        status: 'ACTIVE',
        created_by: presidentId
    });
    const societyId = society._id.toString();
    console.log(`  Society created: ${society.name} (${societyId})`);

    await SocietyUserRole.create({
        name: 'Test President',
        user_id: presidentId,
        society_id: societyId,
        role: 'PRESIDENT',
        assigned_by: presidentId
    });
    console.log('  President role assigned');

    // Create a team/group in the society
    const team = await Group.create({
        society_id: societyId,
        name: 'Engineering Team',
        description: 'The engineering team',
        created_by: presidentId
    });
    const teamId = team._id.toString();
    console.log(`  Team created: ${team.name} (${teamId})`);

    // ── Step 4: Create a join form ───────────────────────────────────
    console.log('\nStep 4: Creating join form...');

    const formRes = await api('POST', `/society/${societyId}/join-forms`, {
        title: 'Join Our Society — Spring 2026',
        description: 'Fill out this form to apply',
        fields: [
            { label: 'Full Name', field_type: 'TEXT', is_required: true },
            { label: 'GPA', field_type: 'NUMBER', is_required: true },
            { label: 'Email Address', field_type: 'EMAIL', is_required: true },
            { label: 'Department', field_type: 'DROPDOWN', is_required: true, options: ['CS', 'SE', 'AI', 'EE'] },
            { label: 'Agree to Code of Conduct', field_type: 'CHECKBOX', is_required: true }
        ],
        is_public: true
    }, presidentToken);
    if (!assert(formRes.status === 201, 'Join form created')) {
        console.error('  Response:', JSON.stringify(formRes.data, null, 2));
    }
    const formId = formRes.data.data._id;
    console.log(`  Form ID (shareable link): ${formId}`);

    // ── Step 5: List forms for society ────────────────────────────────
    console.log('\nStep 5: Listing forms for society...');

    const formsListRes = await api('GET', `/society/${societyId}/join-forms`, undefined, presidentToken);
    assert(formsListRes.status === 200, 'Forms list fetched');
    assert(formsListRes.data.data.length >= 1, 'At least one form exists');

    // ── Step 6: Get single form (president view) ─────────────────────
    console.log('\nStep 6: President getting single form...');

    const singleFormRes = await api('GET', `/society/${societyId}/join-forms/${formId}`, undefined, presidentToken);
    assert(singleFormRes.status === 200, 'Single form fetched');
    assert(singleFormRes.data.data.fields.length === 5, 'Form has 5 fields');

    // ── Step 7: Public form access (no auth) ─────────────────────────
    console.log('\nStep 7: Accessing form publicly (no auth)...');

    const publicFormRes = await api('GET', `/join-forms/${formId}`);
    assert(publicFormRes.status === 200, 'Public form accessible without auth');
    assert(publicFormRes.data.data.form.title === 'Join Our Society — Spring 2026', 'Form title matches');
    assert(Array.isArray(publicFormRes.data.data.teams), 'Teams array returned');
    console.log(`  Teams available: ${publicFormRes.data.data.teams.length}`);

    // ── Step 8: Submit join request (valid data) ─────────────────────
    console.log('\nStep 8: Submitting join request (valid data)...');

    const submitRes = await api('POST', `/join-forms/${formId}/submit`, {
        responses: [
            { field_label: 'Full Name', value: 'Test Applicant' },
            { field_label: 'GPA', value: 3.8 },
            { field_label: 'Email Address', value: 'applicant@test.com' },
            { field_label: 'Department', value: 'CS' },
            { field_label: 'Agree to Code of Conduct', value: true }
        ],
        selected_team: teamId
    }, userToken);
    assert(submitRes.status === 201, 'Join request submitted');
    assert(submitRes.data.data.status === 'PENDING', 'Request status is PENDING');
    const requestId = submitRes.data.data._id;

    // ── Step 9: Duplicate submission prevention ──────────────────────
    console.log('\nStep 9: Testing duplicate submission...');

    const dupeRes = await api('POST', `/join-forms/${formId}/submit`, {
        responses: [
            { field_label: 'Full Name', value: 'Duplicate Attempt' },
            { field_label: 'GPA', value: 3.5 },
            { field_label: 'Email Address', value: 'dup@test.com' },
            { field_label: 'Department', value: 'SE' },
            { field_label: 'Agree to Code of Conduct', value: true }
        ]
    }, userToken);
    assert(dupeRes.status === 400, 'Duplicate pending request blocked');

    // ── Step 10: Validation — missing required field ─────────────────
    console.log('\nStep 10: Validation — missing required field...');

    const valUserSignup = await api('POST', '/auth/signup', {
        name: 'Validation Tester',
        email: `validation_${TS}@test.com`,
        password: 'Test@1234',
        phone: '5555555555'
    });
    const valLogin = await api('POST', '/auth/login', {
        email: `validation_${TS}@test.com`,
        password: 'Test@1234'
    });
    const valToken = valLogin.data.data.accessToken;

    const missingRes = await api('POST', `/join-forms/${formId}/submit`, {
        responses: [
            { field_label: 'Full Name', value: 'Incomplete User' }
        ]
    }, valToken);
    assert(missingRes.status === 400, 'Missing required fields rejected');

    // ── Step 11: Validation — invalid dropdown value ─────────────────
    console.log('\nStep 11: Validation — invalid dropdown value...');

    const badDropdownRes = await api('POST', `/join-forms/${formId}/submit`, {
        responses: [
            { field_label: 'Full Name', value: 'Bad Dropdown User' },
            { field_label: 'GPA', value: 3.5 },
            { field_label: 'Email Address', value: 'bad@test.com' },
            { field_label: 'Department', value: 'INVALID_DEPT' },
            { field_label: 'Agree to Code of Conduct', value: true }
        ]
    }, valToken);
    assert(badDropdownRes.status === 400, 'Invalid dropdown value rejected');

    // ── Step 12: President views all requests ────────────────────────
    console.log('\nStep 12: President viewing join requests...');

    const requestsRes = await api('GET', `/society/${societyId}/join-requests`, undefined, presidentToken);
    assert(requestsRes.status === 200, 'President can view join requests');
    assert(requestsRes.data.data.length >= 1, 'At least one join request exists');

    // ── Step 13: Filter requests by status ───────────────────────────
    console.log('\nStep 13: Filtering requests by status...');

    const filteredRes = await api('GET', `/society/${societyId}/join-requests?status=PENDING`, undefined, presidentToken);
    assert(filteredRes.status === 200, 'Filtered requests fetched');
    assert(filteredRes.data.data.every((r: any) => r.status === 'PENDING'), 'All returned are PENDING');

    // ── Step 14: President views single request detail ────────────────
    console.log('\nStep 14: President viewing single request detail...');

    const detailRes = await api('GET', `/society/${societyId}/join-requests/${requestId}`, undefined, presidentToken);
    assert(detailRes.status === 200, 'President can view request detail');
    assert(detailRes.data.data.responses.length === 5, 'All 5 responses present');

    // ── Step 15: Applicant checks own status ─────────────────────────
    console.log('\nStep 15: Applicant checking their request status...');

    const myReqsRes = await api('GET', `/my/join-requests`, undefined, userToken);
    assert(myReqsRes.status === 200, 'Applicant can view own requests');
    assert(myReqsRes.data.data.length >= 1, 'At least one request shows');
    assert(myReqsRes.data.data[0].status === 'PENDING', 'Status still PENDING');

    // ── Step 16: President approves request ──────────────────────────
    console.log('\nStep 16: President approving the request...');

    const approveRes = await api('PUT', `/society/${societyId}/join-requests/${requestId}`, {
        status: 'APPROVED',
        assign_team: teamId
    }, presidentToken);
    assert(approveRes.status === 200, 'Request approved successfully');
    assert(approveRes.data.data.status === 'APPROVED', 'Status is APPROVED');

    // ── Step 17: Verify user is now a member in DB ───────────────────
    console.log('\nStep 17: Verifying user is now a member...');

    const memberRole = await SocietyUserRole.findOne({
        user_id: applicantId,
        society_id: societyId,
        role: 'MEMBER'
    });
    assert(!!memberRole, 'Applicant has MEMBER role in SocietyUserRole');

    const groupMembership = await GroupMember.findOne({
        user_id: applicantId,
        group_id: teamId,
        society_id: societyId
    });
    assert(!!groupMembership, 'Applicant added to Engineering Team (GroupMember)');

    // ── Step 18: Applicant sees updated status ───────────────────────
    console.log('\nStep 18: Applicant checking updated status...');

    const updatedReqs = await api('GET', `/my/join-requests`, undefined, userToken);
    const approvedReq = updatedReqs.data.data.find((r: any) => r._id === requestId);
    assert(approvedReq?.status === 'APPROVED', 'Applicant sees APPROVED status');

    // ── Step 19: Double-processing prevention ────────────────────────
    console.log('\nStep 19: Testing double-processing prevention...');

    const doubleApprove = await api('PUT', `/society/${societyId}/join-requests/${requestId}`, {
        status: 'APPROVED'
    }, presidentToken);
    assert(doubleApprove.status === 400, 'Already processed request is blocked');

    // ── Step 20: Update form ─────────────────────────────────────────
    console.log('\nStep 20: Updating form...');

    const updateRes = await api('PUT', `/society/${societyId}/join-forms/${formId}`, {
        title: 'Updated Form — Spring 2026',
        is_public: false
    }, presidentToken);
    assert(updateRes.status === 200, 'Form updated successfully');
    assert(updateRes.data.data.title === 'Updated Form — Spring 2026', 'Title updated');
    assert(updateRes.data.data.is_public === false, 'Form is now private');

    // ── Step 21: Private form requires auth ──────────────────────────
    console.log('\nStep 21: Private form requires auth...');

    const privateFormRes = await api('GET', `/join-forms/${formId}`);
    assert(privateFormRes.status === 401, 'Private form returns 401 without auth');

    // ── Step 22: Deactivate form ─────────────────────────────────────
    console.log('\nStep 22: Deactivating form...');

    const deactivateRes = await api('DELETE', `/society/${societyId}/join-forms/${formId}`, undefined, presidentToken);
    assert(deactivateRes.status === 200, 'Form deactivated');

    const deactivatedRes = await api('GET', `/join-forms/${formId}`, undefined, presidentToken);
    assert(deactivatedRes.status === 404, 'Deactivated form returns 404');

    // ── Cleanup ──────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);

    if (failed === 0) {
        console.log('All tests passed!\n');
    } else {
        console.log('Some tests failed. Check the output above.\n');
    }

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (err) => {
    console.error('\nTest script error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
});
