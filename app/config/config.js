import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export const db_start = "hsdc_";
export const db_end = "_tbl";
export const paystack_verify_payment_url = "https://api.paystack.co/transaction/verify/";
export const squad_sandbox_verify_payment_url = "https://sandbox-api-d.squadco.com/transaction/verify/";
export const squad_live_verify_payment_url = "https://api-d.squadco.com/transaction/verify/";
export const primary_domain = "https://hcecr.org";
export const admin_domain = "https://admin.hcecr.org";
export const mailer_url = "https://api.mailer.xnyder.com";
export const clouder_url = "https://api.clouder.xnyder.com";
export const default_path = "hsdc/";

// Password options
export const password_options = {
	minLength: 8,
	maxLength: 30,
	minLowercase: 1,
	minNumbers: 1,
	minSymbols: 1,
	minUppercase: 1
};

// Email Templates -  Not in use, check /config/templates
export const email_templates = {
};

// End - Email Templates

// App Defaults 
export const app_defaults = {
	api_whitelist: "Api_Whitelist",
	paystack_public_key: "Paystack_Public_Key",
	paystack_secret_key: "Paystack_Secret_Key",
	squad_public_key: "Squad_Public_Key",
	squad_secret_key: "Squad_Secret_Key",
	stripe_public_key: "Stripe_Public_Key",
	stripe_secret_key: "Stripe_Secret_Key",
	users_emails: "Users_Emails",
	users_phone_numbers: "Users_Phone_Numbers",
	maintenance: "Maintenance"
};

export const default_app_values = [
	{
		unique_id: uuidv4(),
		criteria: "Maintenance",
		data_type: "BOOLEAN",
		value: false,
		status: 1
	},
	{
		unique_id: uuidv4(),
		criteria: "Paystack_Secret_Key",
		data_type: "STRING",
		value: null,
		status: 1
	},
	{
		unique_id: uuidv4(),
		criteria: "Paystack_Public_Key",
		data_type: "STRING",
		value: null,
		status: 1
	},
	{
		unique_id: uuidv4(),
		criteria: "Users_Emails",
		data_type: "ARRAY",
		value: null,
		status: 1
	},
	{
		unique_id: uuidv4(),
		criteria: "Users_Phone_Numbers",
		data_type: "ARRAY",
		value: null,
		status: 1
	},
	{
		unique_id: uuidv4(),
		criteria: "Api_Whitelist",
		data_type: "ARRAY",
		value: null,
		status: 1
	},
	{
		unique_id: uuidv4(),
		criteria: "Squad_Secret_Key",
		data_type: "STRING",
		value: null,
		status: 1
	},
	{
		unique_id: uuidv4(),
		criteria: "Squad_Public_Key",
		data_type: "STRING",
		value: null,
		status: 1
	},
	{
		unique_id: uuidv4(),
		criteria: "Stripe_Secret_Key",
		data_type: "STRING",
		value: null,
		status: 1
	},
	{
		unique_id: uuidv4(),
		criteria: "Stripe_Public_Key",
		data_type: "STRING",
		value: null,
		status: 1
	},
];
// End - App Defaults

// Accesses
export const access_granted = 1;
export const access_suspended = 2;
export const access_revoked = 3;
export const all_access = [access_granted, access_suspended, access_revoked];
// End - Accesses

export const hsdc_header_key = "hsdc-access-key";
export const hsdc_header_token = "hsdc-access-token";

export const false_status = false;
export const true_status = true;

export const verified_status = true;
export const unverified_status = false;

export const default_status = 1;
export const default_delete_status = 0;
export const default_pending_status = 2;

// String lengths
export const check_length_TINYTEXT = 255;
export const check_length_TEXT = 65535;
export const check_length_MEDIUMTEXT = 16777215;
export const check_length_LONGTEXT = 4294967295;
// End - String lengths

// Default Actions
export const awaiting = "Awaiting";
export const accepted = "Accepted";
export const rejected = "Rejected";
export const admitted = "Admitted";
export const submitted = "Submitted";
export const completed = "Completed";
export const enrolled = "Enrolled";
export const certified = "Certified";
export const active = "Active";
export const deleted = "Deleted";
export const restored = "Restored";
export const received = "Received";
export const returned = "Returned";
export const generated = "Generated";
export const processing = "Processing";
export const cancelled = "Cancelled";
export const pending = "Pending";
export const started = "Started";
export const paid = "Paid";
export const unpaid = "Unpaid";
export const refunded = "Refunded";
export const application_status = { awaiting, submitted, paid, admitted, completed, processing, accepted, rejected };
export const enrollment_status = { enrolled, certified, cancelled, completed };
export const course_types = {
	short_courses: "Short Courses",
	postgraduate_diploma: "Postgraduate Diploma",
	professional_masters: "Professional Masters",
	professional_doctorate: "Professional Doctorate"
};
export const user_types = {
	administrator: "Administrator",
	student: "Student",
	staff: "Staff"
}
export const payment_methods = {
	card: "Credit/Debit Card",
	wallet: "Wallet",
	transfer: "Transfer"
};
export const gateways = {
	paystack: "PAYSTACK",
	squad: "SQUAD",
	stripe: "STRIPE",
	internal: "INTERNAL"
};
export const ratings = [
	{
		rate: "Very Bad",
		value: 1
	},
	{
		rate: "Bad",
		value: 2
	},
	{
		rate: "Ok",
		value: 3
	},
	{
		rate: "Good",
		value: 4
	},
	{
		rate: "Very Good",
		value: 5
	}
];

// End - Default Actions

// Default Currency
export const currency = "NGN"; // NGN - Naira
// End - Default Currency

// Default Transaction Types
export const withdrawal = "Withdrawal";
export const deposit = "Deposit";
export const refund = "Refund";
export const payment = "Payment";
export const enrollment_fee = "Enrollment Fee";
export const certification_fee = "Certification Fee";
export const credit = "Credit";
export const debit = "Debit";
export const reversal = "Reversal";
export const transfer = "Transfer";
export const fees = "Fees";
export const application_fee = "Application Fee";
export const subscription = "Subscription";
export const charges = "Charges";
export const vat = "VAT";
export const transaction_types = { withdrawal, deposit, refund, payment, enrollment_fee, certification_fee, fees, application_fee, credit, debit, reversal, transfer, subscription, charges, vat };
// End - Default Transaction Types

// File lengths
export const file_length_5Mb = 5000000;
export const file_length_10Mb = 10000000;
export const file_length_15Mb = 15000000;
export const file_length_20Mb = 20000000;
export const file_length_25Mb = 25000000;
export const file_length_30Mb = 30000000;
export const file_length_35Mb = 35000000;
export const file_length_40Mb = 40000000;
export const file_length_45Mb = 45000000;
export const file_length_50Mb = 50000000;
export const file_length_55Mb = 55000000;
export const file_length_60Mb = 60000000;
export const file_length_65Mb = 65000000;
export const file_length_70Mb = 70000000;
export const file_length_75Mb = 75000000;
export const file_length_80Mb = 80000000;
export const file_length_85Mb = 85000000;
export const file_length_90Mb = 90000000;
export const file_length_95Mb = 95000000;
export const file_length_100Mb = 100000000;
// End - File lengths

// Paths and document names
export const profile_image_path = default_path + "images/profile";
export const course_image_path = default_path + "images/courses";
export const category_document_path = default_path + "blog/categories";
export const post_document_path = default_path + "blog/images";
export const event_document_path = default_path + "images/events";
export const gallery_document_path = default_path + "images/gallery";
// End - Paths and document names

// API Key
export const tag_internal_api_key = "Internal";
export const tag_external_api_key = "External";
// End - API Key

// App Tags
export const tag_root = "Root";
export const anonymous = "Anonymous";
// End - App Tags

export const start = 1;
export const zero = 0;

export const paginate_limit = 20;

export const today_str = () => {
	const d = new Date();
	const date_str = d.getFullYear() + "-" + ((d.getUTCMonth() + 1) < 10 ? "0" + (d.getUTCMonth() + 1) : (d.getUTCMonth() + 1)) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate());
	return date_str;
};

export const todays_date = () => {
	const d = new Date();
	return d.toDateString();
};

export const year_str = () => {
	const d = new Date();
	const date_str = d.getFullYear();
	return date_str;
};

export const timestamp_str = (date) => {
	const d = new Date(date * 1000);
	return {
		fulldate: d.toDateString() + " at " + d.toLocaleTimeString(),
		date: d.toDateString(),
		time: d.toLocaleTimeString(),
	};
};

export const timestamp_str_alt = (date) => {
	const d = new Date(date);
	const date_ = d.getFullYear() + "-" + ((d.getUTCMonth() + 1) < 10 ? "0" + (d.getUTCMonth() + 1) : (d.getUTCMonth() + 1)) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate());
	const time_ = (d.getHours() < 10 ? "0" + d.getHours() : d.getHours()) + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()) + ":" + (d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds());
	return date_ + " " + time_;
};

export const time_zero_hundred = () => {
	const d = new Date();
	const time_str = (d.getHours() < 10 ? "0" + d.getHours() : d.getHours()) + "00";
	return time_str;
};

export const random_uuid = (length) => {
	if (length === undefined || length === null || length === 0) {
		let values = crypto.randomBytes(20).toString('hex');
		return values;
	} else {
		let values = crypto.randomBytes(length).toString('hex');
		return values;
	}
};

export const random_numbers = (length) => {
	if (length === undefined || length === null || length === 0) {
		return 0;
	} else {
		let rand_number = "";
		for (let index = 0; index < length; index++) {
			rand_number += Math.floor(Math.random() * 10);
		}
		return rand_number;
	}
};

export const test_all_regex = (data, regex) => {
	if (!data) {
		return false;
	}

	const valid = regex.test(data);
	if (!valid) {
		return false;
	}

	return true;
};

export const digit_filter = (digits) => {
	return digits.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const strip_text = (text) => {
	//Lower case everything
	let string = text.toLowerCase();
	//Make alphanumeric (removes all other characters)
	string = string.replace(/[^a-z0-9_\s-]/g, "");
	//Clean up multiple dashes or whitespaces
	string = string.replace(/[\s-]+/g, " ");
	//Convert whitespaces and underscore to dash
	string = string.replace(/[\s_]/g, "-");
	return string;
};

export const strip_text_for_path = (text) => {
	// Lower case everything
	let string = text.toLowerCase();
	// Make alphanumeric (removes all other characters)
	string = string.replace(/[^a-z0-9_/\s-]/g, "");
	// Clean up multiple dashes, slashes or whitespaces
	string = string.replace(/[/\s-]+/g, " ");
	// Convert whitespaces and underscore to dash
	string = string.replace(/[\s_]/g, "/");
	return string;
};

export const unstrip_text = (text) => {
	let string = text.replace(/[-_]/g, " ");
	return string;
};

export const unstrip_text_alt = (text) => {
	let string = text.replace(/[-_]/g, "");
	return string;
};

export const filterBytes = (bytes) => {
	if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '0 bytes';
	var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
		number = Math.floor(Math.log(bytes) / Math.log(1024));
	return (bytes / Math.pow(1024, Math.floor(number))).toFixed(1) + " " + units[number];
};

export const getFileExtension = (filename) => {
	let lastDot = filename.lastIndexOf('.');
	let ext = filename.substring(lastDot + 1);
	return ext;
};

export const strip_text_underscore = (text) => {
	string = text.replace(/[\s]/g, "_");
	return string;
};

export const return_first_letter_uppercase = (str) => {
	return str.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
};

export const return_first_letter_uppercase_alt = (_str) => {
	const str = unstrip_text(_str);
	return str.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
};

export const return_all_letters_uppercase = (str) => {
	return str ? str.toUpperCase() : str;
};

export const return_all_letters_lowercase = (str) => {
	return str ? str.toLowerCase() : str;
};

export const return_trimmed_data = (str) => {
	return str.trim();
};

export const return_sort_by = (str) => {
	if (!str) return "desc";
	else if (str.toLowerCase() !== "asc" && str.toLowerCase() !== "desc") return "desc";
	else return str.toLowerCase();
};

export const return_order_by_for_others = (str) => {
	if (!str) return "createdAt";
	else if (str !== "updatedAt") return "createdAt";
	else return (str === "updatedAt") ? str : str.toLowerCase();
};

export const return_bulk_gallery_array = (galleries, object) => {
	var results = [];
	for (let index = 0; index < galleries.length; index++) {
		const element = galleries[index];

		results.push({
			unique_id: uuidv4(),
			center_unique_id: object.center_unique_id,
			image: element.secure_url,
			image_size: element.bytes,
			image_size_converted: filterBytes(element.bytes),
			image_type: element.format,
			image_public_id: element.public_id,
			status: 1
		});

		if (index === galleries.length - 1) return results;
	}
};

export const generate_reference = () => {
	const d = new Date();
	const first_up = "TX";
	const date_stamp = d.getFullYear() + "" + ((d.getUTCMonth() + 1) < 10 ? "0" + (d.getUTCMonth() + 1) : (d.getUTCMonth() + 1)) + "" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate());
	const full_code = first_up + date_stamp + "H" + random_numbers(5);
	return full_code;
};

export const validate_future_date = (date) => {
	const d = new Date(date);
	const today = new Date();
	if (d === "Invalid Date") return false;
	if (today.getTime() > d.getTime()) return false;
	return true;
};

export const validate_past_date = (date) => {
	const d = new Date(date);
	const today = new Date();
	if (d === "Invalid Date") return false;
	if (today.getTime() < d.getTime()) return false;
	return true;
};

export const validate_future_end_date = (_start, _end) => {
	const start = new Date(_start);
	const end = new Date(_end);
	if (start === "Invalid Date") return false;
	if (end === "Invalid Date") return false;
	if (start.getTime() >= end.getTime()) return false;
	return true;
};

export const validate_future_end_date_alt = (_start, _end) => {
	const start = new Date(_start);
	const end = new Date(_end * 1000);
	if (start === "Invalid Date") return false;
	if (end === "Invalid Date") return false;
	if (start.getTime() >= end.getTime()) return false;
	return true;
};

export const validate_payment_method = (obj) => {
	const method = obj;
	if (method !== payment_methods.card && method !== payment_methods.wallet && method !== payment_methods.transfer) return false;
	return true;
};

export const validate_gateway = (obj) => {
	const method = obj;
	if (method !== gateways.paystack && method !== gateways.squad && method !== gateways.internal) return false;
	return true;
};

export const get_min_and_max_ratings = () => {
	let min = ratings[0].value;
	let max = ratings[0].value;

	ratings.forEach(element => {
		const _value = element.value;
		if (_value < min) min = _value;
		if (_value > max) max = _value;
	});

	let both = { min, max };

	return both;
};

export const validate_ratings = (rating) => {
	const min_max = get_min_and_max_ratings();
	if (rating < min_max.min) return false;
	if (rating > min_max.max) return false;
	return true;
};

export const paginate = (page, _records, total_records) => {
	// Get total pages available for the amount of records needed in each page with total records
	const records = !_records || _records < paginate_limit ? paginate_limit : _records;
	const pages = Math.ceil(total_records / records);
	// return false if page is less than 1 (first page) or greater than pages (last page)
	if (page < 1 || page > pages || !page) {
		return {
			start: 0,
			end: total_records < records ? total_records : records,
			pages: pages,
			limit: total_records < records ? total_records : records,
		};
	}

	// get the end limit
	const end = pages === page ? total_records : (page === 1 ? page * records : page * records);
	// get start limit
	// if records are uneven at the last page, show all records from last ending to the end
	const start = page === 1 ? 0 : (pages === page ? ((total_records - records) - (total_records - (page * records))) : end - records);

	// return object
	return {
		start: start,
		end: end,
		pages: pages,
		limit: end - start,
	};
};

// Centers
export const default_centers = [
	{
		unique_id: uuidv4(),
		name: "Hensard Centre for Culture and Language Studies",
		stripped: strip_text("Hensard Centre for Culture and Language Studies"),
		acronym: "HCCLS",
		url: null,
		status: 1
	},
	{
		unique_id: uuidv4(),
		name: "Hensard Centre for Strategic and Global Studies",
		stripped: strip_text("Hensard Centre for Strategic and Global Studies"),
		acronym: "HCSGS",
		url: null,
		status: 1
	},
	{
		unique_id: uuidv4(),
		name: "Hensard Centre for Governance and Leadership",
		stripped: strip_text("Hensard Centre for Governance and Leadership"),
		acronym: "HCGL",
		url: null,
		status: 1
	},
	{
		unique_id: uuidv4(),
		name: "Hensard Centre for Geo-Sciences and Earth Resources Research",
		stripped: strip_text("Hensard Centre for Geo-Sciences and Earth Resources Research"),
		acronym: "HCGERR",
		url: null,
		status: 1
	},
	{
		unique_id: uuidv4(),
		name: "Hensard Centre for Environment and Climate Research",
		stripped: strip_text("Hensard Centre for Environment and Climate Research"),
		acronym: "HCECR",
		url: null,
		status: 1
	},
	{
		unique_id: uuidv4(),
		name: "Hensard Centre for Science, Technology, and Innovation",
		stripped: strip_text("Hensard Centre for Science, Technology, and Innovation"),
		acronym: "HCSTI",
		url: null,
		status: 1
	},
];
// End - Centers
